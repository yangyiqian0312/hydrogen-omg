import { json } from '@shopify/remix-oxygen';
import { useActionData, Form } from '@remix-run/react';
import { useState } from 'react';

export default function ContactUs() {
    const customerServiceEmail = "omgbeautyservice@yahoo.com";
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: '',
    });

    const actionData = useActionData();
    function sendEmail() {
        var link = document.getElementById('send_email');
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        var name = firstName + " " + lastName;
        var subject = document.getElementById('subject').value;
        var message = "Hello, This is " + name + ".\n\n" + document.getElementById('message').value;
        var href = "mailto:" + customerServiceEmail + "?subject=" + subject + "&body=" + encodeURIComponent(message);
        console.log(href);
        link.setAttribute("href", href);
    };
    return (
        <div className="flex flex-col items-center">
            <div className="text-5xl font-bold py-8" >Contact Us</div>
            <span className="2xl:text-[24px] text-[18px] md:text-[20px] text-gray-800">
                Have questions or need assistance? We're here to help!<br />
                Fill out the form below and we'll get back to you in 48 hours on business days.<br /><br />
                Our Email: <a href={`mailto:${customerServiceEmail}`}>{customerServiceEmail}</a>
            </span>
            <div className="contact-page max-w-md mx-auto my-8 space-y-6 w-full p-6 border rounded-xl shadow">

                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={form.firstName}
                        onChange={(e) => {
                            setForm((prev) => ({ ...prev, firstName: e.target.value }));
                            sendEmail();
                        }}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={form.lastName}
                        onChange={(e) => {
                            setForm((prev) => ({ ...prev, lastName: e.target.value }));
                            sendEmail();
                        }}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={(e) => {
                            setForm((prev) => ({ ...prev, email: e.target.value }));
                            sendEmail();
                        }}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={(e) => {
                            setForm((prev) => ({ ...prev, subject: e.target.value }));
                            sendEmail();
                        }}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                        name="message"
                        id="message"
                        required
                        placeholder="Enter your message"
                        value={form.message}
                        onChange={(e) => {
                            setForm((prev) => ({ ...prev, message: e.target.value }));
                            sendEmail();
                        }}
                        className="w-full p-2 border rounded min-h-32 h-auto mt-2"
                    />
                </div>
                <div className="flex justify-center">
                    <a
                        href=""
                        id="send_email"
                        className='w-full'
                        disabled={form.firstName === '' || form.lastName === '' || form.email === '' || form.subject === '' || form.message === ''}
                    >
                        <button
                            className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={form.firstName === '' || form.lastName === '' || form.email === '' || form.subject === '' || form.message === ''}
                        >
                            Send Email
                        </button>
                    </a>
                </div>


                {actionData && !actionData.success && (
                    <div className="error-message text-center text-sm text-red-600">
                        {actionData.error.message}
                    </div>
                )}
            </div>
        </div >
    );
}