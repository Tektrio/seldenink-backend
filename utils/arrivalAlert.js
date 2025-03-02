// // IMPORTANTE: Após os testes, remova todos os pontos onde tem o if(com o email de rafaelmacedosilva88@hotmail.com)


// const cron = require('node-cron');
// const Book = require('../models/Book');
// const Customer = require('../models/Customer');
// const sendMailer = require('./sendEmail'); 
// const moment = require('moment-timezone');
// const dotenv = require('dotenv');
// dotenv.config({ path: '../config/config.env'});
// const { google } = require('googleapis');
// require('../config/db');


// const CREDENTIALS = JSON.parse(process.env.CREDENTIALS_TEKTRIO);
// const calendarId = process.env.CALENDAR_ID_TEKTRIO;
// const SCOPES = 'https://www.googleapis.com/auth/calendar';

// const auth = new google.auth.JWT(
//     CREDENTIALS.client_email,
//     null,
//     CREDENTIALS.private_key,
//     SCOPES
// );

// const calendar = google.calendar({ version: 'v3', auth });


// const checkArrivalStatus = async () => {
//   const now = moment().tz('America/New_York');
//   // console.log('Hora atual:', now.format('YYYY-MM-DD hh:mm A'));

//   const pendingAppointments = await Book.find({ arrival_status: false }).populate('customer', 'email');

//   pendingAppointments.forEach(async (item) => {
//     if (item.date && item.time) {
//       // convert date and hour appointments to object 
//       const appointmentMoment = moment.tz(
//         `${item.date} ${item.time}`,
//         'YYYY-MM-DD hh:mm A',
//         'America/New_York'
//       );

//       // calculate differ between minutes to be sure
//       const differMinutes = now.diff(appointmentMoment, 'minutes');

//       // filter if is between 1 or 2 hours limit appointment 
//       if (appointmentMoment.isSameOrBefore(now) && differMinutes >= 0 && differMinutes <= 120) {
//         try {
//           if (!item.emailSentToCustomerBeforeAppointment) {
//             const mailOptions = {
//               to: item.customer.email,
//               subject: 'Your appointment already started',
//               message: `You’ll be attended to shortly! Please stay alert and be on time to ensure your appointment: ${item.appointmentNumber}.`
//             };

//             console.log('started appointment')
//             // send e-mail
//             await sendMailer(mailOptions);

//             // update database indicating that e-mail was sent. 
//             await Book.findByIdAndUpdate(
//               item._id,
//               { emailSentToCustomerBeforeAppointment: true },
//               { new: true, runValidators: true }
//             );

//             // console.log('E-mail enviado com sucesso!');
//           }
//         } catch (err) {
//           console.log('Erro ao enviar e-mail:', err);
//         }
//       }

//       // filter if condition is greater than 2 hours later
//       else if (appointmentMoment.isBefore(now) && differMinutes > 120 && moment(item.date, 'YYYY-MM-DD').isBefore(now, 'day') &&!item.cancelled_appointment_customer_sorry) {
//         // const mailOptions = {
//         //   to: item.customer.email,
//         //   subject: 'Your appointment has been canceled',
//         //   message: `We're sorry to inform you that your ${item.appointmentNumber} has been canceled, but don't worry! You can easily schedule a new one.`
//         // };

//         // send e-mail
//         // await sendMailer(mailOptions);

//         // to be cancelled
//         // await Book.findByIdAndUpdate(
//         //   item._id,
//         //   { cancelled_appointment_customer_sorry: true },
//         //   { new: true, runValidators: true }
//         // );

//         // await Book.findByIdAndDelete(item._id);


//         // if(item.googleCalendarEventId){
//         //   await calendar.events.delete({
//         //     calendarId,
//         //     eventId: item.googleCalendarEventId  // O ID do evento a ser excluído
//         //   });
//         // }


//         console.log('O QUE ELE RETORNA DAQUI...');
//         console.log('ITEM --> ', item)
//         // here need to add a logic to remove from google calendar ...
//       }
//     } else {
//       // console.log('Data ou hora do agendamento não disponíveis.');
//     }

//     // console.log('-------------------------------------------------------------------------------');
//   });
// };

// cron.schedule('* * * * *', checkArrivalStatus);

// module.exports = checkArrivalStatus;

// para continuar amanhã
// 20/10/2024
// 1PM 

// date: 







// // Função que verifica e envia alertas para agendamentos sem confirmação de chegada
// const checkArrivalStatus = async () => {
//     const now = moment().tz('America/New_York'); // Horário atual no fuso horário correto
//     console.log('Verificando agendamentos às', now.format('YYYY-MM-DD hh:mm A'));
  
//     // Filtro para buscar agendamentos onde a chegada não foi confirmada e o horário já passou, mas não mais de 2 horas
//     const pendingAppointments = await Book.find({
//       arrival_status: false, // Somente agendamentos não confirmados
//       date: { $lte: now.format('YYYY-MM-DD') }, // Data marcada igual ou anterior ao dia atual
//       time: {
//         $lte: now.format('hh:mm A'), // Horário marcado é menor ou igual ao horário atual (formato 12 horas AM/PM)
//         $gt: now.subtract(2, 'hours').format('hh:mm A') // Horário não pode ter passado mais de 2 horas (formato 12 horas AM/PM)
//       }
//     }).populate('customer', 'email');
  
//     if (pendingAppointments.length === 0) {
//       console.log('Nenhum agendamento pendente para verificação.');
//       return;
//     }
  
//     // Envia um alerta para cada agendamento pendente e controle o envio de e-mails
//     pendingAppointments.forEach(async (appointment) => {
//       const customerEmail = appointment.customer.email;
  
//       // Verifique se já existe um campo `lastEmailSentAt` no agendamento
//       const lastEmailSentAt = appointment.lastEmailSentAt ? moment(appointment.lastEmailSentAt).tz('America/New_York') : null;
  
//       // Se o último e-mail foi enviado há mais de 30 minutos (ou não foi enviado ainda), envie um novo e-mail
//       if (!lastEmailSentAt || now.diff(lastEmailSentAt, 'minutes') >= 30) {
//         const mailOptions = {
//           to: customerEmail, // E-mail do cliente
//           subject: 'Confirme sua chegada ao estúdio',
//           message: `Por favor, confirme sua chegada para o agendamento #${appointment.appointmentNumber}, ou ele será cancelado em breve.`
//         };
  
//         try {
//           // Envia o e-mail de alerta
//           await sendMailer(mailOptions);
//           console.log(`Alerta de e-mail enviado para o agendamento #${appointment.appointmentNumber}`);
  
//           // Encontra novamente o documento para garantir que estamos trabalhando com a última versão
//           const appointmentDoc = await Book.findOne({ _id: appointment._id });
          
//           if (appointmentDoc) {
//             // Atualize o campo `lastEmailSentAt` para marcar o horário do último envio
//             appointmentDoc.lastEmailSentAt = now.toDate();
//             await appointmentDoc.save(); // Salva as modificações no banco de dados
//             console.log(`Campo lastEmailSentAt atualizado para o agendamento #${appointment.appointmentNumber}`);
//           }
  
//           // Após 10 minutos do envio do e-mail, verifique novamente e cancele se o cliente ainda não tiver confirmado
//           setTimeout(async () => {
//             try {
//               const updatedAppointment = await Book.findOne({ _id: appointment._id });
  
//               if (!updatedAppointment) {
//                 console.log(`Agendamento com ID ${appointment._id} não encontrado.`);
//                 return;
//               }
  
//               // Verifica o status de chegada
//               if (!updatedAppointment.arrival_status) {
//                 // Atualiza o agendamento como cancelado se o status de chegada ainda for falso
//                 updatedAppointment.cancelado = true;
//                 await updatedAppointment.save(); // Salva a mudança de status
//                 console.log(`Agendamento #${updatedAppointment.appointmentNumber} cancelado por falta de confirmação.`);
//               } else {
//                 console.log(`Agendamento #${updatedAppointment.appointmentNumber} foi confirmado, não será cancelado.`);
//               }
//             } catch (error) {
//               console.error(`Erro ao tentar cancelar o agendamento ${appointment._id}:`, error);
//             }
//           }, 10 * 60 * 1000); // Espera 10 minutos antes de verificar novamente e cancelar, se necessário
//         } catch (error) {
//           console.error('Erro ao enviar e-mail:', error);
//         }
//       } else {
//         console.log(`E-mail já enviado para o agendamento #${appointment.appointmentNumber} há menos de 30 minutos.`);
//       }
//     });
//   };
  
//   // Agendar a verificação a cada minuto para testes, pode ser ajustado em produção
//   cron.schedule('* * * * *', checkArrivalStatus); // Executa a verificação a cada minuto
  
//   module.exports = checkArrivalStatus;