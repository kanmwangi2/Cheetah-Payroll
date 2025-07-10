import React from 'react';

const faq = [
  { q: 'How do I add a new staff member?', a: 'Go to Staff section and use the Add Staff form.' },
  { q: 'How do I import data?', a: 'Use the Import/Export buttons in each section (Staff, Payments, Deductions).' },
  { q: 'How is payroll calculated?', a: 'Payroll uses Rwanda tax law and the calculation sequence described in Blueprint.md.' },
  { q: 'How do I contact support?', a: 'See the Support section below.' },
];

const Utilities: React.FC = () => (
  <div>
    <h2>Utilities & Support</h2>
    <section>
      <h3>FAQ</h3>
      <ul>
        {faq.map((item, i) => (
          <li key={i}><strong>{item.q}</strong><br />{item.a}</li>
        ))}
      </ul>
    </section>
    <section>
      <h3>Documentation</h3>
      <p>See <a href="./Blueprint.md" target="_blank" rel="noopener noreferrer">Blueprint.md</a> for full product documentation and technical details.</p>
    </section>
    <section>
      <h3>Support</h3>
      <p>Email: support@cheetahpayroll.com<br />Phone: +250 123 456 789</p>
    </section>
    <section>
      <h3>System Information</h3>
      <ul>
        <li>Version: 1.0</li>
        <li>Last Updated: July 2025</li>
      </ul>
    </section>
  </div>
);

export default Utilities;
