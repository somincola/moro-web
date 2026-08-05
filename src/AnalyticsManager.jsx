import { useEffect, useRef, useState } from "react";
import { Partytown } from "@qwik.dev/partytown/react";
import {
  ANALYTICS_PREFERENCES_EVENT,
  GA_MEASUREMENT_ID,
  getAnalyticsConsent,
  saveAnalyticsConsent,
} from "./analytics.js";

function AnalyticsScripts() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  const setup = `
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){window.dataLayer.push(arguments);};
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', '${GA_MEASUREMENT_ID}');
  `;

  return (
    <>
      <Partytown forward={["dataLayer.push"]} />
      <script
        type="text/partytown"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script type="text/partytown" dangerouslySetInnerHTML={{ __html: setup }} />
    </>
  );
}

export function AnalyticsManager() {
  const enabled = import.meta.env.PROD && Boolean(GA_MEASUREMENT_ID);
  const [consent, setConsent] = useState(getAnalyticsConsent);
  const [open, setOpen] = useState(enabled && consent === null);
  const firstButtonRef = useRef(null);

  useEffect(() => {
    const showPreferences = () => {
      setOpen(true);
      window.requestAnimationFrame(() => firstButtonRef.current?.focus());
    };
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, showPreferences);
    return () => window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, showPreferences);
  }, []);

  const choose = (value) => {
    if (!saveAnalyticsConsent(value)) {
      setOpen(false);
      return;
    }
    setConsent(value);
    window.location.reload();
  };

  if (!enabled) return null;

  return (
    <>
      {consent === "granted" ? <AnalyticsScripts /> : null}
      {open ? (
        <section
          className="analytics-consent"
          aria-labelledby="analytics-consent-title"
          aria-describedby="analytics-consent-description"
        >
          <div>
            <h2 id="analytics-consent-title">Optional website analytics</h2>
            <p id="analytics-consent-description">
              With your permission, Google Analytics helps us understand page visits and
              important actions such as opening the App Store. It stays off until you allow it.
              {" "}
              <a href="/privacy">Privacy details</a>
            </p>
          </div>
          <div className="analytics-consent-actions">
            <button
              ref={firstButtonRef}
              className="analytics-consent-decline"
              type="button"
              onClick={() => choose("denied")}
            >
              No thanks
            </button>
            <button
              className="analytics-consent-accept"
              type="button"
              onClick={() => choose("granted")}
            >
              Allow analytics
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
