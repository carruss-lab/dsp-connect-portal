import Script from "next/script";

/** Loads the Intercom Messenger. Anyone who has given us their email in this browser is recognised; everyone else is an anonymous visitor. */
export default function Intercom() {
  const id = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
  if (!id || !/^[a-z0-9]{6,12}$/.test(id)) return null;
  return (
    <Script id="intercom" strategy="lazyOnload">{`
      var who = {}; try { who = JSON.parse(localStorage.getItem("dsp_who") || "{}") || {}; } catch (e) {}
      window.intercomSettings = Object.assign({ api_base: "https://api-iam.intercom.io", app_id: "${id}" }, who.user_id ? { user_id: who.user_id, email: who.email, name: who.name } : {});
      (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${id}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};l();}})();
    `}</Script>
  );
}
