<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // Magia para rendimiento (Colas)
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Event;

/**
 * =========================================================================
 * NOTIFICACIÓN: INSCRIPCIÓN (ENTRADA)
 * =========================================================================
 * ¿Para qué sirve?: Actúa como una entrada virtual. Se envía cuando un 
 * usuario se apunta a un evento para confirmarle la fecha y lugar.
 */
class EventEnrolledNotification extends Notification implements ShouldQueue
{
    // Queueable permite que esta notificación se procese en las colas (Jobs)
    use Queueable;

    public $event;

    /**
     * Recibimos el evento al que el usuario se acaba de apuntar.
     */
    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    /**
     * Definimos que el canal de envío será el correo electrónico.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Construye el cuerpo del correo.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('🎟️ Tu entrada para: ' . $this->event->title)
                    ->greeting('¡Hola, ' . $notifiable->name . '!')
                    ->line('Te confirmamos que te has apuntado correctamente al evento **' . $this->event->title . '**.')
                    // Gracias al casteo ($casts) en el modelo Event, start_at es un objeto 
                    // Carbon de PHP y podemos usar ->format() directamente aquí.
                    ->line('📅 Fecha: ' . $this->event->start_at->format('d/m/Y H:i'))
                    ->line('📍 Ubicación: ' . $this->event->location)
                    // URL apuntando al puerto de desarrollo del frontend de React (5173)
                    ->action('Ver detalles en CaraLibre', url('http://localhost:5173/event/' . $this->event->id))
                    ->line('¡Esperamos que lo disfrutes muchísimo!');
    }
}