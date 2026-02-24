import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json(
      { success: false, error: 'No file provided' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: 'parsed-resume-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          startDate: '2021-01-01',
          endDate: '2024-12-31',
          description: 'Led development of microservices architecture',
        },
        {
          title: 'Software Engineer',
          company: 'StartupXYZ',
          startDate: '2018-06-01',
          endDate: '2020-12-31',
          description: 'Full-stack development with React and Node.js',
        },
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'State University',
          graduationYear: 2018,
          gpa: 3.8,
        },
      ],
      skills: ['TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
      parsedAt: new Date().toISOString(),
    },
  });
}
