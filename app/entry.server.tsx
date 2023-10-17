import { PassThrough } from 'stream';
import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { createInstance } from 'i18next';
import i18next from './i18n/i18next.server';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import Backend from 'i18next-fs-backend';
import i18n from './i18n/i18n';
import { resolve } from 'node:path';

const ABORT_DELAY = 5000;

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext
) {
    let instance = createInstance();
    let lng = await i18next.getLocale(request);
    let ns = i18next.getRouteNamespaces(remixContext);

    await instance
        .use(initReactI18next) // Tell our instance to use react-i18next
        .use(Backend) // Setup our backend
        .init({
            ...i18n, // spread the configuration
            lng, // The locale we detected above
            ns, // The namespaces the routes about to render wants to use
            backend: { loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json') },
        });

    return isbot(request.headers.get('user-agent'))
        ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext, instance)
        : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext, instance);
}

function handleBotRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
    instance: any
) {
    return new Promise((resolve, reject) => {
        let shellRendered = false;
        const { pipe, abort } = renderToPipeableStream(
            <I18nextProvider i18n={instance}>
                <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />
            </I18nextProvider>,
            {
                onAllReady() {
                    shellRendered = true;
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);

                    responseHeaders.set('Content-Type', 'text/html');

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        })
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    responseStatusCode = 500;
                    // Log streaming rendering errors from inside the shell.  Don't log
                    // errors encountered during initial shell rendering since they'll
                    // reject and get logged in handleDocumentRequest.
                    if (shellRendered) {
                        console.error(error);
                    }
                },
            }
        );

        setTimeout(abort, ABORT_DELAY);
    });
}

function handleBrowserRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
    instance: any
) {
    return new Promise((resolve, reject) => {
        let shellRendered = false;
        const { pipe, abort } = renderToPipeableStream(
            <I18nextProvider i18n={instance}>
                <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />
            </I18nextProvider>,
            {
                onShellReady() {
                    shellRendered = true;
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);

                    responseHeaders.set('Content-Type', 'text/html');

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        })
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    responseStatusCode = 500;
                    // Log streaming rendering errors from inside the shell.  Don't log
                    // errors encountered during initial shell rendering since they'll
                    // reject and get logged in handleDocumentRequest.
                    if (shellRendered) {
                        console.error(error);
                    }
                },
            }
        );

        setTimeout(abort, ABORT_DELAY);
    });
}
