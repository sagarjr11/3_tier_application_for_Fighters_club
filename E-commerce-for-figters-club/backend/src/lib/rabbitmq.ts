/**
 * RabbitMQ Connection (amqplib)
 *
 * Used for:
 *   - Order processing queue
 *   - Email/SMS notification queue
 *   - Inventory update queue
 *   - Payment webhook queue
 *
 * RabbitMQ decouples services so API requests don't need to wait
 * for background processing.
 */

import amqplib, { Channel, ChannelModel } from 'amqplib'

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  'amqp://admin:password@localhost:5672'

// Queue names — single source of truth
export const QUEUES = {
  ORDERS:
    process.env.RABBITMQ_QUEUE_ORDERS ||
    'order_queue',

  NOTIFICATIONS:
    process.env.RABBITMQ_QUEUE_NOTIFICATIONS ||
    'notification_queue',

  INVENTORY:
    process.env.RABBITMQ_QUEUE_INVENTORY ||
    'inventory_queue',

  PAYMENTS: 'payment_queue',
} as const

declare global {
  var rabbitConn: ChannelModel | null
  var rabbitChannel: Channel | null
}

let connection: ChannelModel | null =
  global.rabbitConn || null

let channel: Channel | null =
  global.rabbitChannel || null

export async function connectRabbitMQ(): Promise<Channel> {
  if (channel) {
    return channel
  }

  try {
    connection = await amqplib.connect(RABBITMQ_URL)

    channel = await connection.createChannel()

    // Create all queues if they don't already exist
    for (const queue of Object.values(QUEUES)) {
      await channel.assertQueue(queue, {
        durable: true,
      })
    }

    global.rabbitConn = connection
    global.rabbitChannel = channel

    console.log('✅ RabbitMQ connected, queues ready')

    connection.on('error', (err) => {
      console.error(
        '❌ RabbitMQ connection error:',
        err
      )

      global.rabbitConn = null
      global.rabbitChannel = null

      connection = null
      channel = null
    })

    connection.on('close', () => {
      console.warn(
        '⚠️ RabbitMQ connection closed — reconnecting in 5s'
      )

      global.rabbitConn = null
      global.rabbitChannel = null

      connection = null
      channel = null

      setTimeout(() => {
        connectRabbitMQ().catch((err) => {
          console.error(
            '❌ RabbitMQ reconnect failed:',
            err
          )
        })
      }, 5000)
    })

    return channel
  } catch (err) {
    console.error(
      '❌ RabbitMQ connect failed:',
      err
    )

    connection = null
    channel = null

    throw err
  }
}

/**
 * Publish a message to a queue
 */
export async function publishToQueue(
  queue: string,
  message: unknown
) {
  try {
    const ch = await connectRabbitMQ()

    const payload = Buffer.from(
      JSON.stringify({
        ...(typeof message === 'object' && message !== null
          ? message
          : { data: message }),

        publishedAt: new Date().toISOString(),
      })
    )

    // persistent = message survives RabbitMQ restart
    ch.sendToQueue(queue, payload, {
      persistent: true,
    })

    console.log(`📤 Published to ${queue}`)
  } catch (err) {
    console.error(
      `❌ Failed to publish to ${queue}:`,
      err
    )

    throw err
  }
}

/**
 * Consume messages from a queue
 */
export async function consumeQueue(
  queue: string,
  handler: (msg: unknown) => Promise<void>
) {
  const ch = await connectRabbitMQ()

  // Process one message at a time per consumer
  ch.prefetch(1)

  await ch.consume(queue, async (msg) => {
    if (!msg) {
      return
    }

    try {
      const content = JSON.parse(
        msg.content.toString()
      )

      await handler(content)

      // Successfully processed
      ch.ack(msg)
    } catch (err) {
      console.error(
        `❌ Error processing ${queue} message:`,
        err
      )

      // Requeue for retry
      ch.nack(msg, false, true)
    }
  })

  console.log(`👂 Listening on queue: ${queue}`)
}

// ─── Typed publishers ───────────────────────────────

export const OrderPublisher = {
  async newOrder(payload: {
    orderId: string
    userId: string
    items: unknown[]
    total: number
  }) {
    await publishToQueue(
      QUEUES.ORDERS,
      {
        event: 'order.created',
        ...payload,
      }
    )
  },

  async orderCancelled(
    orderId: string,
    userId: string
  ) {
    await publishToQueue(
      QUEUES.ORDERS,
      {
        event: 'order.cancelled',
        orderId,
        userId,
      }
    )
  },
}

export const NotificationPublisher = {
  async sendEmail(payload: {
    to: string
    subject: string
    template: string
    data: unknown
  }) {
    await publishToQueue(
      QUEUES.NOTIFICATIONS,
      {
        channel: 'email',
        ...payload,
      }
    )
  },

  async sendSMS(
    to: string,
    message: string
  ) {
    await publishToQueue(
      QUEUES.NOTIFICATIONS,
      {
        channel: 'sms',
        to,
        message,
      }
    )
  },
}

export const InventoryPublisher = {
  async decrementStock(
    items: {
      productId: string
      quantity: number
    }[]
  ) {
    await publishToQueue(
      QUEUES.INVENTORY,
      {
        event: 'stock.decrement',
        items,
      }
    )
  },

  async restoreStock(
    items: {
      productId: string
      quantity: number
    }[]
  ) {
    await publishToQueue(
      QUEUES.INVENTORY,
      {
        event: 'stock.restore',
        items,
      }
    )
  },
}