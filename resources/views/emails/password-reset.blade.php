<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset - Dagohoy EventHub</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .code { background: #333; color: white; padding: 15px; font-size: 20px; text-align: center; margin: 20px 0; }
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
            <p>Hello {{ $user->name }},</p>
            
            <p>You are receiving this email because we received a password reset request for your account.</p>
            
            <h3>To reset your password:</h3>
            <ol>
                <li>Open <strong>Dagohoy EventHub</strong> on your computer</li>
                <li>Go to the <strong>Reset Password</strong> page</li>
                <li>Enter this reset code:</li>
            </ol>
            
            <div class="code">
                <strong>{{ $token }}</strong>
            </div>
            
            <p>And enter your email: <strong>{{ $user->email }}</strong></p>
            
            <p>This reset code will expire in 60 minutes.</p>
            
            <p>If you did not request a password reset, no further action is required.</p>
            
            <p>Thank you,<br>Dagohoy EventHub Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Dagohoy EventHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>