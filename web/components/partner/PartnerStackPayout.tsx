import { PARTNERSTACK_URL } from "@/lib/site";

/** Payout setup for partners outside the United States, who are paid through PartnerStack, not Stripe. */
export default function PartnerStackPayout() {
  return (
    <>
      <p className="p">Partners outside the United States are paid through PartnerStack. You set up your payout method in your PartnerStack account; DSP Connect never sees your bank details.</p>
      {PARTNERSTACK_URL ? (
        <a className="btn btn-blue" style={{ alignSelf: "flex-start" }} href={PARTNERSTACK_URL} target="_blank" rel="noopener noreferrer">Set up payouts with PartnerStack</a>
      ) : (
        <p className="small">Your PartnerStack invitation comes to you by email. Accept it to set up your payout method.</p>
      )}
    </>
  );
}
