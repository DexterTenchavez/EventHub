<!DOCTYPE html>
<html>
<head>
    <title>New Event Notification</title>
</head>
<body>
    <h2>New Event: {{ $event->title }}</h2>
    <p><strong>Date:</strong> {{ date('F j, Y', strtotime($event->date)) }}</p>
    <p><strong>Time:</strong> {{ $event->time ? date('g:i A', strtotime($event->time)) : 'Time not set' }}</p>
    <p><strong>Location:</strong> {{ $event->location }}</p>
    <p>{{ $event->description }}</p>
    <p>Don't miss it!</p>
</body>
</html>