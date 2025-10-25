<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ config('app.name') }} - Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DAGOHOY EVENTHUB</h1>
            <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
            <p>Hello!</p>
            
            <p>You are receiving this email because we received a password reset request for your account.</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{ $url }}" class="button">Reset Password</a>
            </p>
            
            <p>This password reset link will expire in 60 minutes.</p>
            
            <p>If you did not request a password reset, no further action is required.</p>
            
            <p>Thank you,<br>Dagohoy EventHub Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Dagohoy EventHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>