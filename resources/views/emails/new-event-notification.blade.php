<!DOCTYPE html>
<html>
<head>
    <title>New Event Notification - EventHub</title>
    <style>
        /* Inline CSS for email clients */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .email-header {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .email-header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .event-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .email-content {
            padding: 40px 30px;
        }
        
        .event-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 25px;
            border-left: 5px solid #4CAF50;
        }
        
        .event-title {
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .event-details {
            display: grid;
            gap: 15px;
        }
        
        .detail-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        
        .detail-icon {
            color: #4CAF50;
            font-size: 18px;
            min-width: 20px;
            margin-top: 2px;
        }
        
        .detail-label {
            font-weight: 600;
            color: #555;
            min-width: 100px;
        }
        
        .detail-value {
            color: #2c3e50;
            flex: 1;
        }
        
        .event-description {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            line-height: 1.6;
            color: #555;
        }
        
        .cta-section {
            text-align: center;
            padding: 30px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
        }
        
        .email-footer {
            background: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-text {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-header h1 {
                font-size: 28px;
            }
            
            .email-content {
                padding: 30px 20px;
            }
            
            .event-card {
                padding: 20px;
            }
            
            .detail-item {
                flex-direction: column;
                gap: 5px;
            }
            
            .detail-label {
                min-width: auto;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="event-icon">🎉</div>
            <h1>New Event Alert!</h1>
            <p>Exciting news! A new event has been added to EventHub</p>
        </div>
        
        <!-- Content -->
        <div class="email-content">
            <div class="event-card">
                <h2 class="event-title">{{ $event->title }}</h2>
                
                <div class="event-details">
                    <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">{{ date('F j, Y', strtotime($event->date)) }}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-icon">⏰</span>
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">
                            {{ $event->start_time ? date('g:i A', strtotime($event->start_time)) : 'Time not set' }} - 
                            {{ $event->end_time ? date('g:i A', strtotime($event->end_time)) : 'Time not set' }}
                        </span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-icon">📍</span>
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">{{ $event->location }}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-icon">🏷️</span>
                        <span class="detail-label">Category:</span>
                        <span class="detail-value">{{ $event->category ?? 'Not specified' }}</span>
                    </div>
                </div>
                
                <div class="event-description">
                    <strong>Description:</strong><br>
                    {{ $event->description }}
                </div>
            </div>
            
            <!-- Call to Action -->
            <div class="cta-section">
                <a href="{{ url('/user-dashboard') }}" class="cta-button">
                    View Event & Register
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <p class="footer-text">Don't miss out on this amazing opportunity!</p>
            <p class="footer-text">Stay connected with your community through EventHub</p>
            <p class="footer-text" style="margin-top: 15px; font-size: 12px; color: #999;">
                This is an automated notification from EventHub. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>