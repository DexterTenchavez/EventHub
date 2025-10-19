<!DOCTYPE html>
<html>
<head>
    <title>Event Starting Soon!</title>
    <style>
        .event-details {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #007bff;
        }
        .header {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ecf0f1;
            color: #7f8c8d;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h2 class="header">Event Starting Soon!</h2>
    
    <p>Hello <strong>{{ $registration->name }}</strong>,</p>
    <p>This is a friendly reminder that the event you registered for is starting soon!</p>
    
    <div class="event-details">
        <h3 style="margin-top: 0; color: #2c3e50;">{{ $event->title }}</h3>
        <p><strong>📅 Date:</strong> {{ date('F j, Y', strtotime($event->date)) }}</p>
        <p><strong>⏰ Time:</strong> {{ date('g:i A', strtotime($event->start_time)) }} - {{ date('g:i A', strtotime($event->end_time)) }}</p>
        <p><strong>📍 Location:</strong> {{ $event->location }}</p>
        @if($event->category)
        <p><strong>📋 Category:</strong> {{ $event->category }}</p>
        @endif
        @if($event->description)
        <p><strong>📝 Description:</strong> {{ $event->description }}</p>
        @endif
    </div>
    
    <p>We're excited to have you join us and look forward to seeing you there!</p>
    
  
    </div>
</body>
</html>