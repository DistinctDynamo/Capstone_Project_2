import { Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle, FiShield, FiUsers, FiCalendar } from 'react-icons/fi';

const TermsPage = () => {
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
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Terms and Conditions
          </h1>
          <p className="text-dark-400">Last updated: {lastUpdated}</p>
        </div>

        {/* Important Warning Banner */}
        <div className="card bg-red-500/10 border border-red-500/30 p-6 mb-8">
          <div className="flex items-start gap-4">
            <FiAlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-red-400 mb-2">
                Important Legal Notice
              </h2>
              <p className="text-dark-300">
                By using SoccerConnect, you acknowledge and accept that participation in any
                activities organized through this platform is entirely at your own risk.
                Please read these terms carefully before using our service.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card glass p-8 space-y-8">
          {/* Section 1: Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                1
              </span>
              Acceptance of Terms
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>
                By accessing or using SoccerConnect ("the Platform"), you agree to be bound by these
                Terms and Conditions. If you do not agree to these terms, you must not use the Platform.
              </p>
              <p>
                These terms constitute a legally binding agreement between you and SoccerConnect.
                We reserve the right to modify these terms at any time, and your continued use of
                the Platform constitutes acceptance of any changes.
              </p>
            </div>
          </section>

          {/* Section 2: Platform Description */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                2
              </span>
              Platform Description and Limitations
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>
                SoccerConnect is a <strong className="text-white">connection service only</strong>.
                We provide a platform for soccer enthusiasts to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Find and organize pickup games and events</li>
                <li>Connect with other players and teams</li>
                <li>Discover soccer fields and venues</li>
                <li>Post and browse soccer-related classifieds</li>
              </ul>
              <div className="bg-dark-800/50 p-4 rounded-lg mt-4">
                <p className="text-yellow-400 font-medium mb-2">
                  SoccerConnect is NOT:
                </p>
                <ul className="list-disc list-inside space-y-2 text-dark-300">
                  <li>A sports league or official organizing body</li>
                  <li>Responsible for supervising activities or events</li>
                  <li>A guarantor of field conditions or safety</li>
                  <li>An insurer or provider of medical coverage</li>
                  <li>Responsible for verifying user identities or backgrounds</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Assumption of Risk - CRITICAL */}
          <section className="bg-dark-800/50 rounded-xl p-6 border border-yellow-500/30">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              <FiAlertTriangle className="w-6 h-6" />
              Assumption of Risk and Liability Waiver
            </h2>
            <div className="text-dark-300 space-y-4">
              <p className="text-white font-medium">
                BY USING THIS PLATFORM, YOU EXPRESSLY ACKNOWLEDGE AND AGREE:
              </p>
              <ul className="list-disc list-inside space-y-3">
                <li>
                  <strong className="text-white">Physical Activity Risks:</strong> Soccer and related
                  activities involve inherent risks of physical injury, including but not limited to
                  sprains, fractures, concussions, and other serious injuries. You voluntarily assume
                  all such risks.
                </li>
                <li>
                  <strong className="text-white">No Liability for Injuries:</strong> SoccerConnect,
                  its owners, operators, employees, and affiliates shall NOT be held liable for any
                  injuries, accidents, illness, or death that may occur during activities organized
                  or facilitated through this platform.
                </li>
                <li>
                  <strong className="text-white">No Liability for Disputes:</strong> We are not
                  responsible for any disputes, conflicts, or disagreements between users, including
                  but not limited to issues related to payments, team management, or personal conflicts.
                </li>
                <li>
                  <strong className="text-white">Field and Venue Conditions:</strong> We do not inspect,
                  maintain, or guarantee the safety of any fields, venues, or locations listed on
                  the platform. Users participate at their own risk and should assess venue safety
                  before participating.
                </li>
                <li>
                  <strong className="text-white">Event Outcomes:</strong> We are not responsible for
                  event cancellations, no-shows, incorrect information, or any other issues related
                  to events posted on the platform.
                </li>
                <li>
                  <strong className="text-white">User Conduct:</strong> We are not responsible for
                  the conduct, actions, or behavior of any users on or off the platform. Users
                  interact with each other at their own risk.
                </li>
              </ul>
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mt-4">
                <p className="text-red-400 font-semibold">
                  YOU PARTICIPATE IN ALL ACTIVITIES AT YOUR OWN RISK.
                  SOCCERCONNECT DISCLAIMS ALL LIABILITY TO THE MAXIMUM EXTENT PERMITTED BY LAW.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Age Requirements */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiUsers className="w-6 h-6 text-primary-400" />
              Age Requirements and Parental Consent
            </h2>
            <div className="text-dark-300 space-y-4 pl-2">
              <div className="bg-primary-500/10 border border-primary-500/30 p-4 rounded-lg">
                <h3 className="text-primary-400 font-semibold mb-2">For Users 18 Years and Older:</h3>
                <p>
                  You may use SoccerConnect independently and accept full responsibility for your
                  participation in all activities.
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                <h3 className="text-yellow-400 font-semibold mb-2">For Users Under 18 Years Old:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    You MUST have parental or legal guardian consent to use this platform
                  </li>
                  <li>
                    Your parent/guardian must review and accept these Terms and Conditions on your behalf
                  </li>
                  <li>
                    Your parent/guardian assumes ALL responsibility and liability for your use
                    of the platform and participation in activities
                  </li>
                  <li>
                    Minor users participate entirely at their parents'/guardians' discretion
                  </li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                <h3 className="text-red-400 font-semibold mb-2">Parental/Guardian Liability:</h3>
                <p>
                  <strong>SoccerConnect assumes NO responsibility for minor users.</strong> Parents
                  and legal guardians who permit minors to use this platform accept FULL liability
                  for any injuries, incidents, or issues that may arise. By allowing a minor to
                  register and use SoccerConnect, the parent/guardian acknowledges they have read,
                  understood, and agreed to these terms on behalf of the minor.
                </p>
              </div>

              <p className="text-sm text-dark-400 mt-4">
                We reserve the right to request proof of parental consent for any user believed
                to be under 18 years of age.
              </p>
            </div>
          </section>

          {/* Section 5: User Responsibilities */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                5
              </span>
              User Responsibilities
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>As a user of SoccerConnect, you agree to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide accurate and truthful information in your profile</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the platform in a respectful and lawful manner</li>
                <li>Assess your own physical fitness before participating in activities</li>
                <li>Consult a physician if you have any health concerns before engaging in physical activity</li>
                <li>Carry appropriate insurance coverage for sports activities</li>
                <li>Report any safety concerns or inappropriate behavior to us</li>
                <li>Respect other users and venue rules at all times</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Prohibited Conduct */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                6
              </span>
              Prohibited Conduct
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>Users are prohibited from:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Creating false or misleading profiles or event listings</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Using the platform for illegal activities</li>
                <li>Collecting personal information of other users without consent</li>
                <li>Posting inappropriate, offensive, or discriminatory content</li>
                <li>Attempting to circumvent security measures</li>
                <li>Using the platform for commercial purposes without authorization</li>
              </ul>
              <p className="mt-4">
                Violation of these rules may result in immediate account suspension or termination.
              </p>
            </div>
          </section>

          {/* Section 7: Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FiShield className="w-6 h-6 text-primary-400" />
              Indemnification
            </h2>
            <div className="text-dark-300 space-y-4 pl-2">
              <p>
                You agree to indemnify, defend, and hold harmless SoccerConnect, its owners,
                operators, employees, agents, and affiliates from and against any and all claims,
                liabilities, damages, losses, costs, and expenses (including reasonable attorneys'
                fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Your use of the platform</li>
                <li>Your participation in any activities organized through the platform</li>
                <li>Your violation of these terms</li>
                <li>Your violation of any rights of another person or entity</li>
                <li>Any content you post or share on the platform</li>
              </ul>
            </div>
          </section>

          {/* Section 8: Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                8
              </span>
              Limitation of Liability
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SOCCERCONNECT SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                INCLUDING BUT NOT LIMITED TO PERSONAL INJURY, PROPERTY DAMAGE, LOSS OF USE, LOSS
                OF DATA, OR ANY OTHER INTANGIBLE LOSSES.
              </p>
              <p>
                IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU HAVE PAID TO US
                (IF ANY) IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </div>
          </section>

          {/* Section 9: Termination */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                9
              </span>
              Account Termination
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>
                We reserve the right to suspend or terminate your account at any time, with or
                without cause, and with or without notice. You may also delete your account at
                any time through your account settings.
              </p>
            </div>
          </section>

          {/* Section 10: Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                10
              </span>
              Governing Law
            </h2>
            <div className="text-dark-300 space-y-4 pl-10">
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with
                the laws of the jurisdiction in which SoccerConnect operates, without regard to
                conflict of law principles.
              </p>
            </div>
          </section>

          {/* Section 11: Contact */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                11
              </span>
              Contact Information
            </h2>
            <div className="text-dark-300 pl-10">
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <p className="mt-2 text-primary-400">support@soccerconnect.com</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-dark-400 text-sm">
          <p>
            By using SoccerConnect, you acknowledge that you have read, understood, and agree
            to be bound by these Terms and Conditions.
          </p>
          <div className="mt-4">
            <Link to="/privacy" className="text-primary-400 hover:text-primary-300">
              View Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
