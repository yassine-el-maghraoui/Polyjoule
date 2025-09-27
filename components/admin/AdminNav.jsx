'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AdminNav({ user }) {
  return (
    <nav className="navbar navbar-expand bg-white border-bottom mb-4">
      <div className="container-fluid">
        <Link href="/admin" className="navbar-brand fw-bold">
          Back-office Polyjoule
        </Link>
        <div className="d-flex align-items-center gap-3 ms-auto">
          <span className="text-secondary small">
            {user?.name ?? user?.email}
          </span>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </nav>
  );
}
