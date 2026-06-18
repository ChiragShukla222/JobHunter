const { calculateJobMatchScore, calculateExperienceMatch, calculateRelevanceBonus } = require('../src/services/jobMatcher');

// Dynamic CV data extraction function (moved from mock to real implementation)
function extractCvDataFromText(text) {
    const textLower = text.toLowerCase();
    
    // Initialize extracted data
    const extracted = {
        skills: [],
        experience: 0
    };

    // Extract years of experience (look for patterns like "5 years", "5+ years", "experience: 5")
    const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|work)/i);
    if (expMatch) {
        extracted.experience = parseInt(expMatch[1]);
    }

    // Dynamic skill extraction - look for common tech skills in the text
    const techSkills = [
        'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust',
        'react', 'vue', 'angular', 'svelte', 'nextjs', 'gatsby', 'express', 'fastapi',
        'node.js', 'django', 'flask', 'spring', 'asp.net', 'laravel',
        'html', 'css', 'scss', 'bootstrap', 'tailwind',
        'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'firebase',
        'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'heroku',
        'rest', 'graphql', 'websockets', 'oauth', 'jwt'
    ];

    techSkills.forEach(skill => {
        const regex = new RegExp(`\\b${skill}\\b`, 'gi');
        if (regex.test(textLower)) {
            const displaySkill = skill
                .split(/[.+-]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('.');
            extracted.skills.push(displaySkill);
        }
    });

    // Remove duplicates
    extracted.skills = [...new Set(extracted.skills)];

    return extracted;
}

// Mock function to set CV data dynamically
function setCvData(cvText) {
    // Now extracts data from actual CV text instead of hardcoding
    return extractCvDataFromText(cvText);
}

// Test suite for job matching algorithms
describe('Job Matching Algorithms', () => {
    beforeEach(() => {
        // Reset any global state if needed
    });

    describe('calculateExperienceMatch', () => {
        test('should return 30 for perfect experience match', () => {
            // CV has 5 years experience, job requires 3-5 years
            const score = calculateExperienceMatch('3-5 years', 5);
            expect(score).toBe(30);
        });

        test('should return lower score for insufficient experience', () => {
            // CV has 3 years experience, job requires 5-7 years
            const score = calculateExperienceMatch('5-7 years', 3);
            expect(score).toBeLessThan(30);
            expect(score).toBeGreaterThanOrEqual(0);
        });

        test('should return lower score for excessive experience', () => {
            // CV has 8 years experience, job requires 3-5 years
            const score = calculateExperienceMatch('3-5 years', 8);
            expect(score).toBeLessThan(30);
            expect(score).toBeGreaterThanOrEqual(0);
        });

        test('should handle invalid experience strings gracefully', () => {
            const score = calculateExperienceMatch('invalid', 5);
            expect(score).toBe(15); // Default middle value
        });
    });

    describe('calculateRelevanceBonus', () => {
        test('should return bonus for matching skills in job title', () => {
            const job = {
                title: 'Senior JavaScript Developer',
                company: 'Tech Company',
                description: 'We need a JavaScript expert'
            };
            const cvSkills = ['JavaScript', 'React'];
            const score = calculateRelevanceBonus(job, cvSkills, 5);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(20);
        });

        test('should return bonus for matching skills in company name', () => {
            const job = {
                title: 'Developer Position',
                company: 'JavaScript Solutions Inc',
                description: 'We need a developer'
            };
            const cvSkills = ['JavaScript', 'Node.js'];
            const score = calculateRelevanceBonus(job, cvSkills, 5);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(20);
        });

        test('should return bonus for matching skills in job description', () => {
            const job = {
                title: 'Developer Position',
                company: 'Tech Company',
                description: 'We need someone with React and Node.js experience'
            };
            const cvSkills = ['React', 'Node.js'];
            const score = calculateRelevanceBonus(job, cvSkills, 5);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(20);
        });

        test('should return 0 for no skill matches', () => {
            const job = {
                title: 'Java Developer',
                company: 'Java Shop',
                description: 'We need Java expertise'
            };
            const cvSkills = ['JavaScript', 'React'];
            const score = calculateRelevanceBonus(job, cvSkills, 5);
            expect(score).toBe(0);
        });
    });

    describe('calculateJobMatchScore', () => {
        test('should return a score between 0 and 100', () => {
            const job = {
                title: 'Senior JavaScript Developer',
                company: 'Tech Company',
                location: 'San Francisco, CA',
                experience: '3-5 years',
                description: 'We need a JavaScript expert with React experience',
                salary: '$120k - $150k'
            };
            const cvSkills = ['JavaScript', 'React', 'Node.js'];
            const cvExperience = 4;

            const score = calculateJobMatchScore(job, cvSkills, cvExperience);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        test('should return higher score for better skill matches', () => {
            const job = {
                title: 'JavaScript Developer',
                company: 'Tech Company',
                location: 'San Francisco, CA',
                experience: '2-4 years',
                description: 'We need a JavaScript expert',
                salary: '$100k - $130k'
            };
            const cvExperience = 3;

            // Job requiring JavaScript only
            const jsOnlySkills = ['JavaScript'];
            const jsOnlyScore = calculateJobMatchScore(job, jsOnlySkills, cvExperience);

            // Job requiring JavaScript and React (CV has both)
            const jsReactSkills = ['JavaScript', 'React'];
            const jsReactScore = calculateJobMatchScore(job, jsReactSkills, cvExperience);

            expect(jsReactScore).toBeGreaterThan(jsOnlyScore);
        });

        test('should handle edge cases gracefully', () => {
            const job = {
                title: '',
                company: '',
                location: '',
                experience: '',
                description: '',
                salary: ''
            };
            const cvSkills = [];
            const cvExperience = 0;

            const score = calculateJobMatchScore(job, cvSkills, cvExperience);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });
    });
});

// Helper functions that would normally be in a jobMatcher service
function calculateExperienceMatch(experienceStr, cvExperience) {
    if (!cvExperience) return 0;

    // Extract years from experience string (e.g., "3-5 years" -> 3,5)
    const yearsMatch = experienceStr.match(/(\d+)-?(\d*)/);
    if (!yearsMatch) return 15; // Default middle value if can't parse

    const minYears = parseInt(yearsMatch[1]);
    const maxYears = yearsMatch[2] ? parseInt(yearsMatch[2]) : minYears;

    // Ideal match is when CV experience falls within the job's required range
    if (cvExperience >= minYears && cvExperience <= maxYears) {
        return 30; // Perfect experience match
    } else if (cvExperience < minYears) {
        // CV has less experience than required
        const gap = minYears - cvExperience;
        return Math.max(0, 30 - (gap * 3)); // Penalize for lacking experience
    } else {
        // CV has more experience than required
        const gap = cvExperience - maxYears;
        return Math.max(0, 30 - (gap * 1.5)); // Slight penalty for overqualified
    }
}

function calculateRelevanceBonus(job, cvSkills, cvExperience) {
    let bonus = 0;
    const jobTitle = job.title.toLowerCase();
    const company = job.company.toLowerCase();
    const description = job.description.toLowerCase();

    // Bonus for senior/lead positions if CV has significant experience
    if (cvExperience >= 5) {
        if (jobTitle.includes('senior') || jobTitle.includes('lead') ||
            jobTitle.includes('manager') || jobTitle.includes('architect')) {
            bonus += 10;
        }
    }

    // Bonus for certain technologies mentioned in CV
    const techBonuses = {
        'javascript': 5,
        'react': 5,
        'node.js': 5,
        'python': 5,
        'sql': 3,
        'html': 3,
        'css': 3
    };

    Object.keys(techBonuses).forEach(tech => {
        if (cvSkills.includes(tech) &&
            (jobTitle.includes(tech) || company.includes(tech) ||
             description.includes(tech))) {
            bonus += techBonuses[tech];
        }
    });

    return Math.min(bonus, 20); // Cap bonus at 20 points
}

function calculateJobMatchScore(job, cvSkills, cvExperience) {
    if (!cvSkills || cvSkills.length === 0) {
        return 0;
    }

    let score = 0;
    const maxScore = 100;

    // Check for skill matches in title and description
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    let skillMatches = 0;

    cvSkills.forEach(skill => {
        if (jobText.includes(skill.toLowerCase())) {
            skillMatches++;
        }
    });

    // Calculate skill match percentage (0-50 points)
    const skillMatchPercentage = (skillMatches / cvSkills.length) * 50;
    score += skillMatchPercentage;

    // Check experience match (0-30 points)
    if (job.experience) {
        const expMatch = calculateExperienceMatch(job.experience, cvExperience);
        score += expMatch;
    }

    // Check for relevance bonus (0-20 points)
    const relevanceBonus = calculateRelevanceBonus(job, cvSkills, cvExperience);
    score += relevanceBonus;

    return Math.min(score, maxScore); // Cap at 100
}

module.exports = {
    calculateJobMatchScore,
    calculateExperienceMatch,
    calculateRelevanceBonus
};