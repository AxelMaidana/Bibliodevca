import emailjs from '@emailjs/browser';

export class EmailService {
  private webhookUrl: string | undefined;
  private emailjsServiceId: string | undefined;
  private emailjsTemplateId: string | undefined;
  private emailjsUserId: string | undefined;

  constructor() {
    this.webhookUrl = import.meta.env.VITE_EMAIL_WEBHOOK_URL as string | undefined;
    this.emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
    this.emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
    this.emailjsUserId = import.meta.env.VITE_EMAILJS_USER_ID as string | undefined;
    
    // Inicializar EmailJS si está configurado
    if (this.emailjsUserId) {
      emailjs.init(this.emailjsUserId);
    }
  }

  async sendApprovalEmail(params: { toEmail: string; toName: string; dni: string; userId?: string }) {
    if (!this.webhookUrl) {
      console.warn('VITE_EMAIL_WEBHOOK_URL no está configurado. Se omite el envío de correo.');
      return;
    }

    // Crear URL para completar registro con parámetros codificados
    const registrationUrl = `${window.location.origin}/completar-registro?email=${encodeURIComponent(params.toEmail)}&userId=${encodeURIComponent(params.userId || '')}`;

    const payload = {
      type: 'approval',
      to: params.toEmail,
      subject: 'Tu solicitud fue aprobada - Completa tu registro',
      templateVars: {
        name: params.toName,
        dni: params.dni,
        registrationUrl: registrationUrl,
      },
    };

    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Error enviando correo: ${res.status} ${text}`);
    }
  }
  
  // Método para enviar correo con EmailJS
  async sendApprovalEmailWithEmailJS(params: { toEmail: string; toName: string; dni: string; userId: string }) {
    try {
      // Verificar si EmailJS está configurado
      if (!this.emailjsServiceId || !this.emailjsTemplateId || !this.emailjsUserId) {
        console.warn('EmailJS no está configurado correctamente. Intentando usar webhook alternativo.');
        return this.sendApprovalEmail(params);
      }
      
      // Crear URL para completar registro con parámetros codificados
      const registrationUrl = `${window.location.origin}/completar-registro?email=${encodeURIComponent(params.toEmail)}&userId=${encodeURIComponent(params.userId)}`;
      
      // Configuración para EmailJS
      const templateParams = {
        to_email: params.toEmail,
        to_name: params.toName,
        dni: params.dni,
        registration_url: registrationUrl,
        message: `Tu solicitud de registro ha sido aprobada. Por favor completa tu registro haciendo clic en el siguiente enlace: ${registrationUrl}`
      };
      
      // Enviar correo con EmailJS
      const response = await emailjs.send(
        this.emailjsServiceId,
        this.emailjsTemplateId,
        templateParams,
        this.emailjsUserId
      );
      
      return response;
    } catch (error) {
      console.error('Error al enviar correo con EmailJS:', error);
      // Intentar con el método alternativo
      try {
        return await this.sendApprovalEmail(params);
      } catch (fallbackError) {
        console.error('Error en método alternativo de envío:', fallbackError);
        throw error; // Lanzar el error original
      }
    }
  }
}


