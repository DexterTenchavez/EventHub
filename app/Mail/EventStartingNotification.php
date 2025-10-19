<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Event;
use App\Models\Registration;

class EventStartingNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $event;
    public $registration;

    public function __construct(Event $event, Registration $registration)
    {
        $this->event = $event;
        $this->registration = $registration;
    }

    public function build()
    {
        return $this->subject('Event Starting Soon: ' . $this->event->title)
                    ->view('emails.event_starting');
    }
}