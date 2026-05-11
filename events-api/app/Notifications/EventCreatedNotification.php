<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // Magia para rendimiento (Colas)
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Event;

/**
 * =========================================================================
 * NOTIFICACIÓN: EVENTO CREADO
 * =========================================================================
 * ¿Para qué sirve?: Envía un correo electrónico de felicitación al usuario 
 * justo después de que haya publicado un nuevo evento con éxito.
 */
class EventCreatedNotification extends Notification implements ShouldQueue
{
    // Queueable permite que esta notificación se envíe en segundo plano
    use Queueable;

    public $event;

    /**
     * Constructor: Recibe el evento recién creado desde el EventController.
     */
    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    /**
     * Define por qué canales se enviará esta notificación.
     * Podría ser 'database', 'sms', etc. Aquí especificamos solo 'mail'.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Construye el diseño del correo electrónico.
     * Laravel transforma estos métodos (subject, greeting, line) en una 
     * plantilla HTML muy elegante y responsive automáticamente.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('🚀 ¡Tu evento ya está en directo!')
                    ->greeting('¡Enhorabuena, ' . $notifiable->name . '!')
                    ->line('Has creado con éxito el evento: **' . $this->event->title . '**.')
                    ->line('Ya está visible para toda la comunidad de CaraLibre.')
                    // Redirige al frontend de React (Puerto 5173 por defecto en Vite)
                    ->action('Ver mi evento', url('http://localhost:5173/event/' . $this->event->id))
                    ->line('Recuerda que puedes editarlo o gestionar los asistentes desde tu Dashboard.')
                    ->line('¡Gracias por hacer crecer CaraLibre!');
    }
}