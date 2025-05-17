const amqp = require('amqplib');

(async () => {
  try {
    const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
    console.log('✅ Connecté à RabbitMQ !');
    await conn.close();
  } catch (err) {
    console.error('❌ Erreur de connexion AMQP :', err);
  }
})();