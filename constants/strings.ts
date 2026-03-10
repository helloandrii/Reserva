/**
 * All user-facing strings, centralised for localisation readiness.
 * When i18n is added, replace values with translation function calls.
 */

export const Strings = {

    // ── App ────────────────────────────────────────────────────
    app: {
        name: 'Reserva',
        tagline: 'Book what you need, wherever you are.',
    },

    // ── Onboarding ─────────────────────────────────────────────
    onboarding: {
        slides: [
            {
                title: 'Welcome to Reserva',
                subtitle: 'The easiest way to discover and book local services.',
            },
            {
                title: 'Find Services Nearby',
                subtitle: 'Browse hair, beauty, fitness, cleaning and more — all on a live map.',
            },
            {
                title: 'Book in Seconds',
                subtitle: 'Pick a time slot, confirm your booking, and you\'re done.',
            },
        ],
        userType: {
            heading: 'How will you use Reserva?',
            userButton: 'I\'m a User',
            userSubtitle: 'Find and book services',
            businessButton: 'I\'m a Business',
            businessSubtitle: 'List and manage services',
        },
        auth: {
            heading: 'Sign in to continue',
            google: 'Continue with Google',
            apple: 'Continue with Apple',
            email: 'Continue with Email',
            terms: 'By continuing you agree to our',
            termsLink: 'Terms of Service',
            and: 'and',
            privacyLink: 'Privacy Policy',
        },
        business: {
            heading: 'Set up your business',
            subtitle: 'Manage your services, bookings, and profile all in one place.',
        },
    },

    // ── Map ────────────────────────────────────────────────────
    map: {
        searchPlaceholder: 'Search services',
        categories: [
            'Hair',
            'Beauty',
            'Cleaning',
            'Fitness Classes',
            'Language',
            'Spa',
            'Massage',
            'Car Detailing',
            'Photography',
        ],
        popularServices: 'Popular Services',
        nearYou: 'Services Near You',
        seeAll: 'See All',
        locationDenied: 'Location permission required',
        locationDeniedMessage: 'Enable location access to see services near you.',
    },

    // ── Bookings ───────────────────────────────────────────────
    bookings: {
        title: 'Bookings',
        upcoming: 'Upcoming',
        past: 'Past',
        empty: {
            upcoming: 'No upcoming bookings',
            upcomingSubtitle: 'Your confirmed bookings will appear here.',
            past: 'No past bookings',
            pastSubtitle: 'Your booking history will appear here.',
        },
        cancel: 'Cancel Booking',
        cancelConfirm: 'Are you sure you want to cancel this booking?',
        cancelConfirmYes: 'Yes, cancel',
        cancelConfirmNo: 'Keep it',
        status: {
            upcoming: 'Upcoming',
            completed: 'Completed',
            cancelled: 'Cancelled',
        },
    },

    // ── Profile ────────────────────────────────────────────────
    profile: {
        title: 'Profile',
        signIn: 'Sign in to access your profile',
        signInSubtitle: 'Save bookings and preferences across devices.',
        displayName: 'Name',
        email: 'Email',
        phone: 'Phone',
        savedServices: 'Saved Services',
        usedServices: 'Used Services',
        signOut: 'Sign Out',
        deleteAccount: 'Delete Account',
        deleteAccountConfirm: 'This will permanently delete your account and all data. This cannot be undone.',
        deleteAccountYes: 'Delete',
        deleteAccountNo: 'Cancel',
        settings: 'Settings',
        settingsComingSoon: 'Settings coming soon',
        editPhoto: 'Change Photo',
    },

    // ── Service Details ────────────────────────────────────────
    service: {
        bookNow: 'Book Now',
        location: 'Location',
        description: 'About',
        timeSlots: 'Available Times',
        rating: 'Rating',
        noSlots: 'No available time slots',
    },

    // ── Booking Flow ───────────────────────────────────────────
    booking: {
        title: 'Book Service',
        selectDate: 'Select Date',
        selectTime: 'Select Time',
        notes: 'Notes (optional)',
        notesPlaceholder: 'Any special requests...',
        confirm: 'Confirm Booking',
        success: 'Booking Confirmed!',
        successSubtitle: 'Your booking has been saved.',
        addToCalendar: 'Add to Calendar',
        backToHome: 'Back to Home',
    },

    // ── Common ─────────────────────────────────────────────────
    common: {
        loading: 'Loading...',
        error: 'Something went wrong',
        retry: 'Try Again',
        cancel: 'Cancel',
        save: 'Save',
        done: 'Done',
        next: 'Next',
        back: 'Back',
        getStarted: 'Get Started',
        comingSoon: 'Coming Soon',
    },

} as const;
