import { GA_MEASUREMENT_ID } from "./analytics.js";

// Static markup; the small consent controller enables it after checking storage.
export function AnalyticsConsent() {
  if (!import.meta.env.PROD || !GA_MEASUREMENT_ID) return null;
  return (
    <section className="analytics-consent" hidden aria-labelledby="analytics-consent-title" aria-describedby="analytics-consent-description">
      <div>
        <h2 id="analytics-consent-title">Optional website analytics</h2>
        <p id="analytics-consent-description">
          With your permission, Google Analytics helps us understand page visits and
          important actions such as opening the App Store. It stays off until you allow it.
          {" "}<a href="/privacy">Privacy details</a>
        </p>
      </div>
      <div className="analytics-consent-actions">
        <button className="analytics-consent-decline" type="button" data-analytics-consent="denied">No thanks</button>
        <button className="analytics-consent-accept" type="button" data-analytics-consent="granted">Allow analytics</button>
      </div>
    </section>
  );
}
