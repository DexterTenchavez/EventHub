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
            padding: 0;
            background: #f5f7fa;
        }
        .email-container {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .email-header {
            padding: 30px;
            text-align: center;
            color: white;
        }
        .email-header-info {
            background: #2196F3;
        }
        .email-header-warning {
            background: #FF9800;
        }
        .email-header-emergency {
            background: #F44336;
        }
        .email-content {
            padding: 30px;
        }
        .announcement-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 15px;
            color: white;
        }
        .badge-info { background: #2196F3; }
        .badge-warning { background: #FF9800; }
        .badge-emergency { background: #F44336; }
        .announcement-message {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid;
            margin: 20px 0;
        }
        .message-info { 
            border-left-color: #2196F3;
            background: #E3F2FD;
        }
        .message-warning { 
            border-left-color: #FF9800;
            background: #FFF3E0;
        }
        .message-emergency { 
            border-left-color: #F44336;
            background: #FFEBEE;
        }
        .user-notice {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .cta-button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin: 10px 0;
            font-weight: 500;
        }
        .email-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .announcement-type-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header email-header-{{ $announcement['type'] }}">
            <div class="announcement-type-icon">
                @if($announcement['type'] === 'info')
                    ℹ️
                @elseif($announcement['type'] === 'warning')
                    ⚠️
                @elseif($announcement['type'] === 'emergency')
                    🚨
                @else
                    📢
                @endif
            </div>
            <h1>EventHub Announcement</h1>
            <p>Important update from EventHub System</p>
        </div>
        
        <div class="email-content">
            <div class="announcement-badge badge-{{ $announcement['type'] }}">
                {{ ucfirst($announcement['type']) }} Announcement
            </div>
            
            <h2>{{ $announcement['title'] }}</h2>
            
            <div class="announcement-message message-{{ $announcement['type'] }}">
                {!! nl2br(e($announcement['message'])) !!}
            </div>
            
            <div class="user-notice">
                <strong>Hello {{ $user->name }},</strong><br>
                This announcement was sent to you because you are a registered user of EventHub.
                @if(isset($announcement['barangay']) && $announcement['barangay'])
                    <br>Target audience: Users in {{ $announcement['barangay'] }}
                @else
                    <br>Target audience: All Users
                @endif
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ url('/') }}" class="cta-button">
                    Visit EventHub
                </a>
            </div>
        </div>
        
        <div class="email-footer">
            <p>&copy; {{ date('Y') }} EventHub System. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>
                <a href="{{ url('/unsubscribe') }}" style="color: #667eea; text-decoration: none;">
                    Unsubscribe from announcements
                </a>
            </p>
        </div>
    </div>
</body>
</html>