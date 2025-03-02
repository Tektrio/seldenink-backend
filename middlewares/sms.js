const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configuração do cliente API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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'; // Substitua pela sua chave API

// Instância da API de SMS
const smsApi = new SibApiV3Sdk.TransactionalSMSApi();

// Configurar os dados do SMS
const sendTransacSms = {
    sender: 'Rafael',  // Nome ou número do remetente (máx. 11 caracteres para texto)
    recipient: '+5581987659536', // Número do destinatário no formato internacional
    content: 'Texto da mensagem a ser enviada.', // Mensagem de até 160 caracteres
    tag: 'YourTagName', // Nome da tag, útil para rastrear o SMS
    type: 'transactional', // Tipo de mensagem: 'marketing' ou 'transactional'
};

// Enviar o SMS
smsApi.sendTransacSms(sendTransacSms).then(function(data) {
    console.log('SMS enviado com sucesso:', JSON.stringify(data));
}).catch(function(error) {
    console.error('Erro ao enviar SMS:', error.response?.text || error.message);
});

