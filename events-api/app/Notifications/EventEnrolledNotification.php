<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // ¡Esto es la magia de las colas!
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Event;

class EventEnrolledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $event;

    /**
     * Recibimos el evento al que se acaba de apuntar.
     */
    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    /**
     * Definimos por qué canales se enviará (en este caso, solo correo).
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Construimos el diseño del correo.
     * Laravel transforma esto en un HTML muy elegante automáticamente.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('🎟️ Tu entrada para: ' . $this->event->title)
                    ->greeting('¡Hola, ' . $notifiable->name . '!')
                    ->line('Te confirmamos que te has apuntado correctamente al evento **' . $this->event->title . '**.')
                    ->line('📅 Fecha: ' . $this->event->start_at->format('d/m/Y H:i'))
                    ->line('📍 Ubicación: ' . $this->event->location)
                    //puerto frontend de React 5173
                    ->action('Ver detalles en CaraLibre', url('http://localhost:5173/event/' . $this->event->id))
                    ->line('¡Esperamos que lo disfrutes muchísimo!');
    }
}