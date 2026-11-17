import Script from "next/script";

/** Loads the Intercom Messenger. A browser that has proved who it is (see lib/chatId.ts) is logged in with a
 *  server-signed JWT, so Fin, the banners and the team know them; everyone else is an anonymous visitor. */
export default function Intercom() {
  const id = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
  if (!id || !/^[a-z0-9]{6,12}$/.test(id)) return null;
  return (
    <Script id="intercom" strategy="lazyOnload">{`
      (function(){
        var base = { api_base: "https://api-iam.intercom.io", app_id: "${id}" };
        function load(extra){
          window.intercomSettings = Object.assign({}, base, window.intercomSettings || {}, extra || {});
          var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${id}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};l();}
        }
        var name; try { name = (JSON.parse(localStorage.getItem("dsp_who") || "{}") || {}).name; } catch (e) {}
        fetch("/api/chat/token", { cache: "no-store" }).then(function(r){ return r.ok ? r.json() : {}; }).catch(function(){ return {}; })
          .then(function(t){ load(t && t.jwt ? Object.assign({ intercom_user_jwt: t.jwt }, name ? { name: name } : {}) : {}); });
      })();
    `}</Script>
  );
}
