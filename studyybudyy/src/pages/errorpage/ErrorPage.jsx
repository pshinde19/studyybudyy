// src/pages/ErrorPage.jsx
import { useRouteError, Link } from "react-router-dom";
import styles from "./ErrorPage.module.css";

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  const is404 = error?.status === 404;
  const statusCode = error?.status || "Error";
  const statusText = error?.statusText || "Unknown Error";
  const errorMessage = error?.message || "An unexpected error occurred";

  return (
    <div className={styles.errorContainer}>
      {/* Background Decorative Blobs */}
      <div className={`${styles.bgBlob} ${styles.blobOne}`}></div>
      <div className={`${styles.bgBlob} ${styles.blobTwo}`}></div>

      {/* Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.errorCard}>
          {/* Status Code Icon */}
          <div className={styles.statusIconContainer}>
            <div className={styles.statusIcon}>
              <span className={styles.statusCode}>{statusCode}</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className={styles.errorTitle}>
            {is404 ? "Page Not Found" : "Oops! Something Went Wrong"}
          </h1>

          {/* Status Text */}
          <p className={styles.statusText}>{statusText}</p>

          {/* Error Description */}
          <p className={styles.errorDescription}>
            {is404
              ? "The page you're looking for doesn't exist. It might have been moved or deleted."
              : "A technical error occurred while processing your request. Please try again later."}
          </p>

          {/* Error Details Box */}
          {errorMessage && (
            <div className={styles.errorDetailsBox}>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <Link to="/" className={styles.primaryBtn}>
              Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className={styles.secondaryBtn}
            >
              Go Back
            </button>
          </div>

          {/* Footer Message */}
          <p className={styles.footerMessage}>
            If you continue experiencing issues, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;