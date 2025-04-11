import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { Mail } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext'; // Adjusted path

// Define the expected structure of the 'contact' translations object
interface ContactDataTranslations {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitButton: string;
    // Add contactDescription if it's moved here, otherwise it needs to be passed separately
}

interface ContactSectionProps {
    // isDarkMode: boolean; // Removed prop
    contactTranslations: ContactDataTranslations; // Renamed prop
    // Pass contactDescription separately if it's not part of contactTranslations
    contactDescriptionTranslation: string;
}

function ContactSection({ /* isDarkMode, */ contactTranslations, contactDescriptionTranslation }: ContactSectionProps) { // Removed isDarkMode from destructuring
    const { showToast } = useNotifications();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            showToast('Please fill in all fields.', 'error');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }


        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            message: formData.message,
            to_email: 'tiger3homs@gmail.com', // Consider making this configurable
            name: formData.name, // Included for template compatibility if needed
            email: formData.email // Included for template compatibility if needed
        };

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const userId = import.meta.env.VITE_EMAILJS_USER_ID;

        if (!serviceId || !templateId || !userId) {
            console.error('EmailJS environment variables are not set correctly in .env file.');
            showToast('Configuration error. Unable to send message.', 'error');
            return;
        }

        emailjs.send(serviceId, templateId, templateParams, userId)
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                // Use the correct translation key from the prop
                showToast(contactTranslations.submitButton || 'Message sent successfully!', 'success');
                setFormData({ name: '', email: '', message: '' }); // Clear form on success
            }, (error) => {
                console.log('FAILED...', error);
                showToast('Failed to send message. Please try again later.', 'error');
            });
    };

    // Use dark: prefixes for styling
    return (
        <div id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    {/* Text color inherits from MainSite's wrapper or can be set explicitly */}
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        {/* Use the title from the prop */}
                        {contactTranslations.title}
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
                        {/* Use the separate description prop */}
                        {contactDescriptionTranslation}
                    </p>
                </div>
                <div className="mt-12">
                    <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                {/* Use the nameLabel from the prop */}
                                {contactTranslations.nameLabel}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md bg-white text-gray-900 border-gray-300 placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                                    // Use the namePlaceholder from the prop
                                    placeholder={contactTranslations.namePlaceholder}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">
                                {/* Use the emailLabel from the prop */}
                                {contactTranslations.emailLabel}
                            </label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md bg-white text-gray-900 border-gray-300 placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                                    // Use the emailPlaceholder from the prop
                                    placeholder={contactTranslations.emailPlaceholder}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="message" className="block text-sm font-medium">
                                {/* Use the messageLabel from the prop */}
                                {contactTranslations.messageLabel}
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md bg-white text-gray-900 border-gray-300 placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                                    // Use the messagePlaceholder from the prop
                                    placeholder={contactTranslations.messagePlaceholder}
                                ></textarea>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                            >
                                {/* Use the submitButton from the prop */}
                                {contactTranslations.submitButton}
                                <Mail className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContactSection;
