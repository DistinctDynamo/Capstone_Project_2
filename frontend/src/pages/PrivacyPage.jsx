import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShield, FiLock, FiDatabase, FiMail, FiEye } from 'react-icons/fi';

const PrivacyPage = () => {
  const lastUpdated = 'February 8, 2026';

  return (
    <div className="min-h-screen bg-dark-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-8"
        >
          <FiArrowLeft />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow mb-6">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-dark-400">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="card glass p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiEye className="w-6 h-6 text-primary-400" />
              Introduction
            </h2>
            <div className="text-dark-300 space-y-4">
              <p>
                SoccerConnect ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our platform.
              </p>
              <p>
                By using SoccerConnect, you consent to the data practices described in this policy.
                If you do not agree with the terms of this policy, please do not use our platform.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiDatabase className="w-6 h-6 text-primary-400" />
              Information We Collect
            </h2>
            <div className="text-dark-300 space-y-4">
              <h3 className="text-lg font-medium text-white">Personal Information</h3>
              <p>We may collect the following personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name (first and last name)</li>
                <li>Email address</li>
                <li>Username</li>
                <li>Date of birth</li>
                <li>Phone number (optional)</li>
                <li>Location/city (optional)</li>
                <li>Profile photo (optional)</li>
                <li>Soccer-related preferences (position, skill level, etc.)</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6">Usage Information</h3>
              <p>We automatically collect certain information when you use our platform:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>IP address</li>
                <li>Pages visited and features used</li>
                <li>Time and date of visits</li>
                <li>Interaction with other users</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                3
              </span>
              How We Use Your Information
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>To create and manage your account</li>
                <li>To facilitate connections between users</li>
                <li>To enable event organization and team management</li>
                <li>To send important notifications about your account and activities</li>
                <li>To improve our platform and user experience</li>
                <li>To respond to customer service requests</li>
                <li>To enforce our Terms and Conditions</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Age Verification */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                4
              </span>
              Age Verification and Minors
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>
                We collect date of birth information to verify user age and ensure appropriate
                consent is obtained. For users under 18:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Parental or guardian consent is required for registration</li>
                <li>Parents/guardians are responsible for their child's use of the platform</li>
                <li>We do not knowingly collect personal information from children under 13
                    without verified parental consent</li>
              </ul>
              <p className="mt-4">
                If we learn that we have collected personal information from a child under 13
                without verification of parental consent, we will delete that information.
              </p>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                5
              </span>
              Information Sharing and Disclosure
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>We may share your information in the following circumstances:</p>

              <h3 className="text-white font-medium mt-4">With Other Users:</h3>
              <p>
                Your profile information (name, username, location, soccer preferences) may be
                visible to other users to facilitate connections and team formation.
              </p>

              <h3 className="text-white font-medium mt-4">With Service Providers:</h3>
              <p>
                We may share information with third-party service providers who perform services
                on our behalf, such as hosting, analytics, and email delivery.
              </p>

              <h3 className="text-white font-medium mt-4">For Legal Compliance:</h3>
              <p>
                We may disclose information if required by law, court order, or government request,
                or if we believe disclosure is necessary to protect our rights or the safety of users.
              </p>

              <h3 className="text-white font-medium mt-4">Business Transfers:</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be
                transferred to the acquiring entity.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiLock className="w-6 h-6 text-primary-400" />
              Data Security
            </h2>
            <div className="text-dark-300 space-y-4">
              <p>
                We implement appropriate technical and organizational measures to protect your
                personal information against unauthorized access, alteration, disclosure, or
                destruction. These measures include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit (HTTPS)</li>
                <li>Secure password hashing</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
              </ul>
              <p className="mt-4 text-yellow-400">
                However, no method of transmission over the Internet or electronic storage is
                100% secure. We cannot guarantee absolute security of your data.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                7
              </span>
              Your Rights and Choices
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">Access:</strong> Request access to your personal data</li>
                <li><strong className="text-white">Correction:</strong> Request correction of inaccurate data</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your account and data</li>
                <li><strong className="text-white">Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong className="text-white">Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at the email address provided below.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                8
              </span>
              Cookies and Tracking
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on
                our platform. Cookies are small data files stored on your device that help us:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Remember your login status</li>
                <li>Understand how you use our platform</li>
                <li>Improve our services</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Disabling cookies may
                affect the functionality of certain features.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                9
              </span>
              Data Retention
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>
                We retain your personal information for as long as your account is active or as
                needed to provide you with our services. We may also retain certain information
                as required by law or for legitimate business purposes.
              </p>
              <p>
                When you delete your account, we will delete or anonymize your personal
                information within 30 days, except where we are required to retain it for
                legal or regulatory purposes.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                10
              </span>
              Changes to This Policy
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by posting the new policy on this page and updating the
                "Last updated" date.
              </p>
              <p>
                Your continued use of the platform after any changes indicates your acceptance
                of the updated policy.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiMail className="w-6 h-6 text-primary-400" />
              Contact Us
            </h2>
            <div className="text-dark-300 space-y-4">
              <p>
                If you have any questions about this Privacy Policy or our data practices,
                please contact us at:
              </p>
              <div className="bg-dark-800/50 p-4 rounded-lg">
                <p className="text-primary-400 font-medium">privacy@soccerconnect.com</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-dark-400 text-sm">
          <p>
            By using SoccerConnect, you acknowledge that you have read and understood this
            Privacy Policy.
          </p>
          <div className="mt-4">
            <Link to="/terms" className="text-primary-400 hover:text-primary-300">
              View Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
