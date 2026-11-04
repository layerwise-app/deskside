import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router';

/** Shown when a page fails to render. */
export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  console.error(error);
  return (
    <main className='grid-page min-h-[100dvh] content-center'>
      <p className='label col-span-3 mt-3 text-muted'>Something broke</p>
      <div className='col-span-9 col-start-4 max-md:mt-4'>
        <h1 className='text-[clamp(40px,5vw,72px)] leading-[0.96] font-medium tracking-[-0.04em]'>
          This page didn’t load.
        </h1>
        <p className='mt-5 max-w-[48ch] text-[18px] leading-relaxed text-muted'>
          Try again in a moment. If it keeps happening, the desk still works.
        </p>
        <div className='label mt-8 flex gap-6'>
          <button type='button' className='underline underline-offset-4' onClick={() => router.invalidate()}>
            Try again
          </button>
          <Link to='/' className='underline underline-offset-4'>
            Back to the desk
          </Link>
        </div>
      </div>
    </main>
  );
}
