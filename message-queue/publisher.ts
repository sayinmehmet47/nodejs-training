import amqp from "amqplib";

const RABBITMQ_URL =
  "amqps://sbqbmypz:0AlZy3g3sJml0RADAZxMMxZjCrUAD1kh@fuji.lmq.cloudamqp.com/sbqbmypz";
const EXCHANGE = "logs";

async function publish() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertExchange(EXCHANGE, "fanout", { durable: false });

  let count = 0;
  setInterval(() => {
    const msg = JSON.stringify({
      id: ++count,
      text: `Hello #${count}`,
      time: new Date().toISOString(),
    });
    channel.publish(EXCHANGE, "", Buffer.from(msg));
    console.log(`[PUB] Sent: ${msg}`);
  }, 2000);
}

publish().catch(console.error);
