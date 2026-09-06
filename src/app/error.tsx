"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <p>{error.digest ? "Please try again." : error.message}</p>
      <button type="button" onClick={retry}>
        Try again
      </button>
    </main>
  );
}
