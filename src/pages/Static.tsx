import { Link } from "react-router-dom";
import { useTitle } from "../lib/useTitle";

interface Doc {
  title: string;
  intro: string;
  sections: { h: string; p: string[] }[];
  legal?: boolean;
}

const docs: Record<string, Doc> = {
  about: {
    title: "About Roamly",
    intro: "Roamly helps people find places worth visiting and gives them reasons to go.",
    sections: [
      { h: "What we're building", p: ["A map and community for resorts, restaurants, beaches, attractions and hidden gems, starting in Nigeria.", "Visitors get honest information and rewards for exploring. Businesses get tools to be found, to talk to customers and to measure what works."] },
      { h: "How we think about it", p: ["Discover, experience, connect, reward and grow. Every feature should support at least one of these."] },
    ],
  },
  terms: {
    title: "Terms of service",
    intro: "These terms will govern your use of Roamly.",
    legal: true,
    sections: [
      { h: "Accounts", p: ["You must provide accurate information and keep your login secure. You are responsible for activity on your account."] },
      { h: "Content", p: ["You keep ownership of what you post. You give Roamly permission to display it on the platform. Reviews must reflect real experiences, and paid or incentivised content must be disclosed."] },
      { h: "Businesses", p: ["Businesses must own or be authorised to represent a listing, keep information accurate and honour offers they publish."] },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "How Roamly collects, uses and protects personal data, including under the Nigeria Data Protection Act.",
    legal: true,
    sections: [
      { h: "Location", p: ["Roamly uses your device location only when you ask it to find nearby places or check in. We do not publish your live location or movements, and you control what appears on your public profile."] },
      { h: "What we collect", p: ["Account details, content you post, messages you send, and activity needed to run rewards and prevent fraud."] },
      { h: "Your choices", p: ["You will be able to export your data, change privacy settings and delete your account, subject to records we must legally keep."] },
    ],
  },
  "token-terms": {
    title: "Roamly Token terms",
    intro: "What Roamly Tokens are and what they are not.",
    legal: true,
    sections: [
      { h: "Promotional rewards", p: ["Tokens are an internal promotional reward. They are not money, are not a cryptocurrency, cannot be withdrawn or transferred, and have no guaranteed cash value."] },
      { h: "Earning", p: ["Tokens are awarded for verified visits and approved activity under rules Roamly publishes. Rules and amounts can change for future activity but will not retroactively change rewards already earned."] },
      { h: "Reversals", p: ["Tokens obtained through fraud, error or manipulation can be reversed, and every reversal is recorded in your history."] },
      { h: "Prize draws", p: ["Randomised prize draws are not available. If they are ever introduced, separate rules will apply."] },
    ],
  },
  guidelines: {
    title: "Community guidelines",
    intro: "Roamly works when people trust what they read.",
    sections: [
      { h: "Be honest", p: ["Review places you've actually visited. Don't buy, trade or fake reviews, likes or followers."] },
      { h: "Be respectful", p: ["No harassment, hate, impersonation or spam. You can block and report accounts and content."] },
      { h: "Disclose", p: ["If you were paid, gifted or rewarded to post, say so."] },
      { h: "Businesses", p: ["You may reply to reviews but may not remove honest negative ones because you disagree."] },
    ],
  },
};

export default function Static({ id }: { id: keyof typeof docs }) {
  const d = docs[id];
  useTitle(d.title);
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-extrabold sm:text-5xl">{d.title}</h1>
      <p className="mt-3 text-lg text-muted">{d.intro}</p>
      {d.legal && (
        <p role="note" className="mt-6 rounded-xl bg-accent-soft p-4 text-sm">
          Draft summary. This document has not been through legal review and is not the final binding text.
        </p>
      )}
      <div className="mt-10 space-y-8">
        {d.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-2xl font-bold">{s.h}</h2>
            {s.p.map((t) => <p key={t} className="mt-2 max-w-prose leading-relaxed">{t}</p>)}
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted">Questions? <Link to="/about" className="font-semibold text-accent-text hover:underline">About Roamly</Link></p>
    </div>
  );
}
