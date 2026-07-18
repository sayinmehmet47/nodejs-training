import amqp from "amqplib";

const RABBITMQ_URL =
  "amqps://sbqbmypz:0AlZy3g3sJml0RADAZxMMxZjCrUAD1kh@fuji.lmq.cloudamqp.com/sbqbmypz";
const EXCHANGE = "logs";

async function consume() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertExchange(EXCHANGE, "fanout", { durable: false });

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE, "");

  console.log(`[SUB] Bound to exchange "${EXCHANGE}" on queue "${q.queue}"`);
  console.log(`[SUB] Waiting for messages...`);

  channel.consume(
    q.queue,
    (msg) => {
      if (!msg) return;
      const content = JSON.parse(msg.content.toString());
      console.log(`[SUB] Received:`, content);
    },
    { noAck: true },
  );
}

consume().catch(console.error);
