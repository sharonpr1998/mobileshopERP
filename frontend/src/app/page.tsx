
import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Mobile Phones",
    description:
      "Explore smartphones and discover devices that fit your everyday needs.",
  },
  {
    number: "02",
    title: "Repair & Maintenance",
    description:
      "Professional repair services to help keep your devices working smoothly.",
  },
  {
    number: "03",
    title: "Accessories",
    description:
      "Find useful accessories and essentials for your mobile devices.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">

          <Link href="/" className="text-2xl font-bold tracking-tight">
            MOBILECARE<span className="text-blue-600">.</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-600 sm:gap-8">
            <Link href="/" className="transition hover:text-blue-600">
              Home
            </Link>
            <Link href="#products" className="transition hover:text-blue-600">
              Products
            </Link>
            <Link href="#services" className="transition hover:text-blue-600">
              Services
            </Link>
            <Link href="#about" className="transition hover:text-blue-600">
              About
            </Link>
            <Link href="#contact" className="transition hover:text-blue-600">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Register
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">

          <div className="max-w-4xl">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              Mobile Technology & Services
            </p>

            <h1 className="mt-8 text-5xl font-semibold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              Technology that
              <span className="block text-slate-400">
                moves with you.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
              Discover quality mobile products, dependable repair
              services and a better way to stay connected.
              Everything you need, in one place.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">

              <Link
                href="#products"
                className="rounded-lg bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Explore Products →
              </Link>

              <Link
                href="#services"
                className="rounded-lg border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
              >
                Our Services
              </Link>

            </div>

          </div>

          <div className="mt-24 grid grid-cols-1 gap-8 border-t border-slate-200 pt-8 sm:grid-cols-3">

            <div>
              <p className="text-sm font-semibold">Mobile Sales</p>
              <p className="mt-2 text-sm text-slate-500">
                Smartphones and accessories
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">Repair Services</p>
              <p className="mt-2 text-sm text-slate-500">
                Professional device support
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">Customer Care</p>
              <p className="mt-2 text-sm text-slate-500">
                Reliable customer assistance
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Products Section */}
      <section
        id="products"
        className="border-y border-slate-100 bg-slate-50 px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Discover More
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Find what fits your world.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-slate-500">
              Discover mobile devices and everyday essentials
              selected to make your connected life easier.
            </p>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">

            <div className="flex min-h-64 flex-col justify-between rounded-xl bg-white p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Collection 01
                </p>

                <h3 className="mt-5 text-2xl font-semibold">
                  Smartphones
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500">
                  Explore mobile devices for work, entertainment
                  and everyday communication.
                </p>
              </div>

              <Link
                href="/login"
                className="mt-8 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Explore collection →
              </Link>
            </div>

            <div className="flex min-h-64 flex-col justify-between rounded-xl bg-white p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Collection 02
                </p>

                <h3 className="mt-5 text-2xl font-semibold">
                  Accessories
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500">
                  Discover accessories and essentials for
                  your mobile devices.
                </p>
              </div>

              <Link
                href="/login"
                className="mt-8 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Explore collection →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            What We Offer
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Service built around you.
          </h2>

          <div className="mt-12 grid border-t border-slate-200 md:grid-cols-3">

            {services.map((service) => (
              <div
                key={service.number}
                className="border-b border-slate-200 py-9 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"
              >
                <p className="text-sm font-semibold text-blue-600">
                  {service.number}
                </p>

                <h3 className="mt-7 text-xl font-semibold">
                  {service.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  {service.description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-slate-950 px-6 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              About Us
            </p>

            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Making mobile experiences simple and reliable.
            </h2>
          </div>

          <p className="text-base leading-8 text-slate-300">
            We bring mobile sales, repair services and customer
            support together in one organised experience.
            Our focus is on quality products, dependable service
            and lasting customer relationships.
          </p>

        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Get in Touch
          </p>

          <div className="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">

            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                We&apos;re here to help you.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                Have a question about a product or service?
                Connect with our team.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex w-fit rounded-lg bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Contact Us →
            </Link>

          </div>
        </div>
      </section>

      {/* Footer */}
<footer className="border-t border-slate-200 px-6 py-8">
  <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">

    <Link href="/" className="text-lg font-bold tracking-tight">
      MOBILECARE<span className="text-blue-600">.</span>
    </Link>

    <p className="text-sm text-slate-500">
      Copyright 2026 MobileCare. All rights reserved.
    </p>

  </div>
</footer>

    </main>
  );
}
