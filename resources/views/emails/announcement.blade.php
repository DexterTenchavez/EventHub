<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>EventHub Announcement</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .announcement-type {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        .type-info { background: #2196F3; color: white; }
        .type-warning { background: #FF9800; color: white; }
        .type-emergency { background: #F44336; color: white; }
        .message {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📢 EventHub Announcement</h1>
        <p>Important update from EventHub System</p>
    </div>
    
    <div class="content">
        <div class="announcement-type type-{{ $announcement['type'] }}">
            {{ ucfirst($announcement['type']) }} Announcement
        </div>
        
        <h2>{{ $announcement['title'] }}</h2>
        
        <div class="message">
            {!! nl2br(e($announcement['message'])) !!}
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong>Hello {{ $user->name }},</strong><br>
            This announcement was sent to you because you are a registered user of EventHub.
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ url('/') }}" 
               style="background: #667eea; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
                Visit EventHub
            </a>
        </div>
    </div>
    
    <div class="footer">
        <p>&copy; {{ date('Y') }} EventHub System. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>
            <a href="{{ url('/unsubscribe') }}" style="color: #667eea; text-decoration: none;">
                Unsubscribe from announcements
            </a>
        </p>
    </div>
</body>
</html>