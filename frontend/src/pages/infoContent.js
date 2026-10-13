// Policy/info copy for the customer-facing legal pages. Figures here mirror the
// values used in checkout (see Checkout.jsx / orderController.js) — keep them in sync.
export const INFO_PAGES = {
  faq: {
    eyebrow: 'Help', title: 'Frequently Asked Questions',
    summary: 'Answers to the questions we hear most often about ordering, delivery and care.',
    sections: [
      { heading: 'Are Luxora watches authentic?', body: ['Every Luxora watch is inspected before dispatch and ships with its own serial number and warranty card.'] },
      { heading: 'Which payment methods do you accept?', body: ['Cash on Delivery is available nationwide. Online card payment is being prepared and will be announced here once available.'] },
      { heading: 'Can I change or cancel my order?', body: ['You can cancel an order while it is still Pending or Confirmed by contacting our team. Once an order has shipped, please use our returns process.'] },
      { heading: 'How do I track my order?', body: ['Sign in and open Account → Orders. Each order shows a live status timeline from Order Placed through to Delivered.'] },
    ],
  },
  shipping: {
    eyebrow: 'Delivery', title: 'Shipping Information',
    summary: 'Nationwide delivery across Pakistan, in premium protective packaging.',
    sections: [
      { heading: 'Delivery options', body: ['Standard delivery takes 5–7 business days and costs PKR 2,500. Express delivery takes 2–3 business days and costs PKR 4,500.'] },
      { heading: 'Free shipping', body: ['Orders with a subtotal above PKR 150,000 qualify for free standard shipping.'] },
      { heading: 'Packaging & insurance', body: ['Each watch is shipped in a protective presentation box inside a tamper-evident outer carton.'] },
    ],
  },
  returns: {
    eyebrow: 'Returns', title: 'Returns & Exchanges',
    summary: 'If your watch is not right, we will make it right.',
    sections: [
      { heading: 'Return window', body: ['You may request a return within 7 days of delivery, provided the watch is unworn, undamaged and in its original packaging with all tags and documents.'] },
      { heading: 'How to return', body: ['Contact our team with your order number. We will arrange collection and, once the watch is inspected, refund or exchange it.'] },
      { heading: 'Custom builds', body: ['Watches created with Build Your Watch are made to your specification and can only be returned if they arrive defective.'] },
    ],
  },
  warranty: {
    eyebrow: 'Care', title: 'Warranty',
    summary: 'Every Luxora watch is covered against manufacturing defects.',
    sections: [
      { heading: 'What is covered', body: ['Our warranty covers defects in materials and workmanship of the movement and case for the period stated on each product page (typically two years).'] },
      { heading: 'What is not covered', body: ['Accidental damage, water damage beyond the rated water resistance, unauthorised repairs, and normal wear on straps and crystals.'] },
      { heading: 'Making a claim', body: ['Keep your warranty card and proof of purchase, then contact our team with your order number and a description of the issue.'] },
    ],
  },
  privacy: {
    eyebrow: 'Legal', title: 'Privacy Policy',
    summary: 'How Luxora Watches collects, uses and protects your personal information.',
    sections: [
      { heading: 'Information we collect', body: ['Account details (name, email, phone), delivery addresses, order history, and messages you send us. Passwords are stored only as salted hashes.'] },
      { heading: 'How we use it', body: ['To process and deliver orders, provide customer support, send order notifications, and — only if you opt in — send occasional newsletters.'] },
      { heading: 'Cookies', body: ['We use a secure, HTTP-only cookie to keep you signed in. We store your theme preference and recent searches in your browser. We do not use advertising cookies.'] },
      { heading: 'Your choices', body: ['You can update or delete your saved addresses and profile at any time, and ask us to delete your account by contacting our team.'] },
    ],
  },
  terms: {
    eyebrow: 'Legal', title: 'Terms of Service',
    summary: 'The terms that apply when you use Luxora Watches.',
    sections: [
      { heading: 'Orders & pricing', body: ['All prices are in Pakistani Rupees (PKR). An order is confirmed once we accept it; we may cancel an order if a product is unavailable or a pricing error occurred, and will refund any payment made.'] },
      { heading: 'Accounts', body: ['You are responsible for keeping your password confidential and for activity on your account.'] },
      { heading: 'Intellectual property', body: ['All content, imagery and branding on this site belong to Luxora Watches and may not be reused without permission.'] },
    ],
  },
};
