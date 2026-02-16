import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { App } from '../index.js';

interface SendNotificationBody {
  title: string;
  message: string;
}

interface SendNotificationResponse {
  success: boolean;
  notificationId?: string;
  error?: string;
}

export function register(app: App, fastify: FastifyInstance) {
  fastify.post<{ Body: SendNotificationBody }>(
    '/api/notifications/send',
    {
      schema: {
        description: 'Send a push notification via OneSignal',
        tags: ['notifications'],
        body: {
          type: 'object',
          required: ['title', 'message'],
          properties: {
            title: { type: 'string', description: 'Notification title' },
            message: { type: 'string', description: 'Notification message' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              notificationId: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean', const: false },
              error: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean', const: false },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: SendNotificationBody }>, reply: FastifyReply) => {
      const { title, message } = request.body;

      app.logger.info({ title, message }, 'Sending push notification via OneSignal');

      try {
        // Validate request body
        if (!title || !message) {
          app.logger.warn({ title, message }, 'Missing required fields in notification request');
          return reply.status(400).send({
            success: false,
            error: 'Missing required fields: title and message',
          } as SendNotificationResponse);
        }

        // Get OneSignal credentials from environment variables
        const appId = '84bd5859-82bd-44dd-8a2e-c7e1ccca59f9';
        const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

        if (!restApiKey) {
          app.logger.error({}, 'OneSignal REST API key not configured');
          return reply.status(500).send({
            success: false,
            error: 'OneSignal not configured',
          } as SendNotificationResponse);
        }

        // Prepare the OneSignal API request payload
        const payload = {
          app_id: appId,
          included_segments: ['All'],
          headings: { en: title },
          contents: { en: message },
        };

        app.logger.debug({ payload }, 'OneSignal payload prepared');

        // Send notification via OneSignal REST API
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Basic ${restApiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.text();
          app.logger.error(
            { status: response.status, errorData, title, message },
            'OneSignal API returned error'
          );
          return reply.status(500).send({
            success: false,
            error: `OneSignal API error: ${response.statusText}`,
          } as SendNotificationResponse);
        }

        const responseData = await response.json() as { id?: string };
        const notificationId = responseData.id;

        app.logger.info({ notificationId, title, message }, 'Notification sent successfully');

        return reply.send({
          success: true,
          notificationId,
        } as SendNotificationResponse);
      } catch (error) {
        app.logger.error({ err: error, title, message }, 'Failed to send notification');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        } as SendNotificationResponse);
      }
    }
  );
}
