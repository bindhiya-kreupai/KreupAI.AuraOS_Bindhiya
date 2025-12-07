
export const jobPostingsSeed = [
    {
        title: 'Senior Product Designer',
        department: 'Design',
        location: 'Remote (US)',
        type: 'Remote',
        status: 'Active',
        postedDate: new Date('2024-11-20'),
        metrics: { views: 1250, clicks: 450, applies: 42 },
        channels: { linkedin: true, indeed: true, website: true, glassdoor: false },
        description: 'We are looking for a Senior Product Designer to lead our design system initiatives...'
    },
    {
        title: 'Backend Engineer (Go)',
        department: 'Engineering',
        location: 'New York, NY',
        type: 'Full-time',
        status: 'Active',
        postedDate: new Date('2024-11-25'),
        metrics: { views: 890, clicks: 120, applies: 15 },
        channels: { linkedin: true, indeed: false, website: true, glassdoor: true },
        description: 'Join our backend team to build scalable microservices in Go...'
    },
    {
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'London, UK',
        type: 'Full-time',
        status: 'Draft',
        postedDate: new Date('2024-12-01'),
        metrics: { views: 0, clicks: 0, applies: 0 },
        channels: { linkedin: false, indeed: false, website: false, glassdoor: false },
        description: 'We need a strategic Marketing Manager to oversee our European expansion...'
    },
    {
        title: 'Frontend Developer (React)',
        department: 'Engineering',
        location: 'Bangalore, IN',
        type: 'Full-time',
        status: 'Paused',
        postedDate: new Date('2024-11-15'),
        metrics: { views: 2300, clicks: 600, applies: 150 },
        channels: { linkedin: true, indeed: true, website: true, glassdoor: true },
        description: 'Looking for a React expert to help build our next-gen dashboard...'
    }
];
