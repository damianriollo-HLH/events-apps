<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Event;

class EventCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $event;

    public function __construct(Event $event)
    {
        $this->event = $event;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('🚀 ¡Tu evento ya está en directo!')
                    ->greeting('¡Enhorabuena, ' . $notifiable->name . '!')
                    ->line('Has creado con éxito el evento: **' . $this->event->title . '**.')
                    ->line('Ya está visible para toda la comunidad de CaraLibre.')
                    ->action('Ver mi evento', url('http://localhost:5173/event/' . $this->event->id))
                    ->line('Recuerda que puedes editarlo o gestionar los asistentes desde tu Dashboard.')
                    ->line('¡Gracias por hacer crecer CaraLibre!');
    }
}