StackIt – A Minimal Q&A Forum Platform

Overview
StackIt is a minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. It's designed to be simple, user-friendly, and focused on the core experience of asking and answering questions within a community.

🎯 Problem Statement
Modern Q&A platforms are often cluttered with unnecessary features. StackIt provides a clean, focused experience for knowledge sharing without the complexity.

Project Video Link
https://drive.google.com/drive/folders/1_5zGpWiDDEGVcg0KOTT7IoHnk5lmwwOA?usp=sharing

✨ Features

User Roles

- Guest: View all questions and answers
- User: Register, log in, post questions/answers, vote
- Admin: Moderate content and manage platform

Core Functionality

- Ask Questions: Submit questions with title, rich description, and tags
- Rich Text Editor: Support for formatting, lists, emojis, links, and images
- Answer Questions: Post formatted answers to any question
- Voting System: Upvote/downvote answers
- Accept Answers: Question owners can mark accepted answers
- Tagging: Organize questions with relevant tags
- Notifications: Real-time notifications for interactions

🛠 Tech Stack

Frontend

- React
- JavaScript
- Tailwind CSS

Backend

- Node.js/Express
- MongoDB
- Redis
- JWT Authentication
- Socket.io

🚀 Getting Started

Prerequisites

- Node.js
- npm
- MongoDB

Installation

1. Clone the repository

git clone https://github.com/KhushPatel2026/Odoo-2k25-Pixel.git
cd Odoo-2k25-Pixel

2. Install dependencies

Frontend
cd frontend
npm install
npm run dev

Backend
cd backend
npm install
node app.js

3. Environment Setup

Backend .env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=5000

Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000

4. Run the application

bash
Backend
npm run dev

Frontend (new terminal)
cd frontend
npm run dev

Visit `http://localhost:3000` to see the application.

📁 Project Structure

stackit/
├── frontend/ React/Next.js frontend
│ ├── components/ Reusable components
│ ├── pages/ Next.js pages
│ ├── hooks/ Custom React hooks
│ └── utils/ Utility functions
├── backend/ Node.js/Express backend
│ ├── routes/ API routes
│ ├── models/ Database models
│ ├── middleware/ Custom middleware
│ └── controllers/ Route controllers
└── docs/ Documentation

🎨 Design

- Clean, minimal interface
- Mobile-responsive design
- Dark/light mode support

🔧 API Endpoints

Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

Questions

- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get specific question
- `PUT /api/questions/:id` - Update question

Answers

- `POST /api/questions/:id/answers` - Post answer
- `PUT /api/answers/:id/vote` - Vote on answer
- `PUT /api/answers/:id/accept` - Accept answer

🧪 Testing

bash
Run tests
npm test

Run tests with coverage
npm run test:coverage


👥 Team

- Frontend Developer: [Pranshu Oza]
- Backend Developer: [Khush Patel]
- UI/UX Designer: [Nishant Mehat]

🏆 Hackathon Details

- Event: Odoo 2025 Hackathon
- Track: Web Development
- Duration: 8 hours
- Demo: [Live Demo Link]

📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

📞 Contact

- Project Repository: [GitHub Link]
- Live Demo: [Demo Link]
- Presentation: [Slides Link]

Built with ❤️ for Odoo 2025 Hackathon
