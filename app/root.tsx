// core
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { cssBundleHref } from '@remix-run/css-bundle';
import type { LoaderFunctionArgs, LinksFunction } from '@remix-run/node';
import { useChangeLanguage } from 'remix-i18next';
import { useTranslation } from 'react-i18next';
import i18next from './i18n/i18next.server';

export const links: LinksFunction = () => [...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : [])];

export async function loader({ request }: LoaderFunctionArgs) {
    let locale = await i18next.getLocale(request);
    console.log(locale, 'locale');

    return json({ locale });
}

export let handle = {
    i18n: 'common',
};

export default function Root() {
    let { locale } = useLoaderData<typeof loader>();

    let { i18n } = useTranslation();

    useChangeLanguage(locale);

    return (
        <html lang={locale} dir={i18n.dir()}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
