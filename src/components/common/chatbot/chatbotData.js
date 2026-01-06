// chatbotData.js - Quick questions and bot responses

export const quickQuestions = [
    {
        id: '1',
        text: 'How do I adopt a pet?',
        answer: 'To adopt a pet, visit our Adopt page and browse available pets. Once you find your perfect match, fill out an adoption application. Our team will review it and contact you within 2-3 business days to schedule a meet-and-greet!'
    },
    {
        id: '2',
        text: 'What vaccinations does my pet need?',
        answer: 'Essential vaccinations vary by pet type. Dogs need rabies, distemper, parvovirus, and bordetella. Cats need rabies, feline distemper, and calicivirus. Consult with a veterinarian for a personalized vaccination schedule based on your pet\'s age and lifestyle.'
    },
    {
        id: '3',
        text: 'How can I volunteer?',
        answer: 'We love our volunteers! Visit our Volunteer page to see available opportunities. You can help with dog walking, cat socialization, event support, and more. Fill out the volunteer application and attend our orientation session to get started!'
    },
    {
        id: '4',
        text: 'What should I feed my new pet?',
        answer: 'Choose high-quality pet food appropriate for your pet\'s age, size, and breed. Look for foods with real meat as the first ingredient. Puppies and kittens need specially formulated food for growth. Always provide fresh water and avoid toxic foods like chocolate, grapes, and onions.'
    },
    {
        id: '5',
        text: 'I lost my pet, what should I do?',
        answer: 'Don\'t panic! Immediately check your local area and ask neighbors. Post on our Lost & Found page with a photo and description. Contact local shelters and vets. Put up flyers in your neighborhood and check social media lost pet groups. Most lost pets are found within a few miles of home.'
    },
    {
        id: '6',
        text: 'How do I house-train my puppy?',
        answer: 'Consistency is key! Take your puppy outside frequently - after meals, naps, and play. Praise them when they go outside. Use a crate for supervision when you can\'t watch them. Clean accidents with enzyme cleaner. Most puppies are house-trained by 4-6 months with patience and routine.'
    }
];

export const petKeywords = {
    'adopt': 'To adopt a pet, visit our Adopt page! Browse available pets and submit an application. Our team reviews applications within 2-3 days.',
    'food': 'Feed your pet high-quality food appropriate for their age and size. Always provide fresh water and avoid toxic foods like chocolate and grapes.',
    'vaccine': 'Vaccinations are crucial! Dogs need rabies, distemper, and parvovirus vaccines. Cats need rabies and feline distemper. Consult your vet for a schedule.',
    'lost': 'If you\'ve lost your pet, post on our Lost & Found page immediately. Check with local shelters and put up flyers in your neighborhood.',
    'volunteer': 'We appreciate volunteers! Visit our Volunteer page to see opportunities like dog walking, cat socialization, and event support.',
    'donate': 'Your donations help us care for animals! Visit our Donate page to contribute. Every dollar makes a difference.',
    'training': 'Training takes patience! Use positive reinforcement, be consistent, and start with basic commands like sit and stay.',
    'vet': 'Regular vet checkups are important! Schedule annual visits and keep vaccinations up to date. Don\'t hesitate to call if something seems wrong.',
    'puppy': 'Puppies need lots of attention, training, and socialization. House-train early, provide appropriate toys, and schedule puppy vaccinations.',
    'kitten': 'Kittens are curious and playful! Provide scratching posts, litter training, and kitten-proof your home by hiding cords and small objects.',
    'help': 'I\'m here to help with pet-related questions! Ask about adoption, pet care, volunteering, lost pets, or anything else pet-related.',
    'hello': 'Hello! 🐾 I\'m your friendly Pet Assistant. How can I help you today? Feel free to ask about adoption, pet care, or volunteering!',
    'hi': 'Hi there! 🐕 Welcome to PetVerse. I\'m here to answer your pet-related questions. What would you like to know?'
};

export function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check for keyword matches
    for (const [keyword, response] of Object.entries(petKeywords)) {
        if (lowerMessage.includes(keyword)) {
            return response;
        }
    }

    // Default response
    return "Thanks for your question! While I may not have a specific answer for that, our team is always happy to help. You can reach out through our contact page or explore our website for more information about adoption, volunteering, and pet care. Is there anything else I can help you with? 🐾";
}
