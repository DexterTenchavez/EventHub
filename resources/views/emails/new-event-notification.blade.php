<!DOCTYPE html>
<html>
<head>
    <title>New Event Notification</title>
</head>
<body>
    <h2>New Event: {{ $event->title }}</h2>
    <p><strong>Date:</strong> {{ date('F j, Y', strtotime($event->date)) }}</p>
    <p><strong>Time:</strong> {{ $event->start_time ? date('g:i A', strtotime($event->start_time)) : 'Time not set' }} - {{ $event->end_time ? date('g:i A', strtotime($event->end_time)) : 'Time not set' }}</p>
    <p><strong>Location:</strong> {{ $event->location }}</p>
    <p><strong>Category:</strong> {{ $event->category ?? 'Not specified' }}</p>
    <p>{{ $event->description }}</p>
    <p>Don't miss it!</p>
</body>
</html>