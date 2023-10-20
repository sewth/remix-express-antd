import React from 'react';
import { Button, Menu, Table } from 'antd';
import { useLoaderData, useSubmit } from '@remix-run/react';
import type { MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';

import { useTranslation } from 'react-i18next';
const prisma = new PrismaClient();

export const meta: MetaFunction = () => {
    return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix1!' }];
};

export const loader = async () => {
    const users = await prisma.user.findMany();
    return users;
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const form = await request.formData();
    if (request.method === 'POST') {
        await prisma.user.createMany({
            data: [
                {
                    name: form.get('name') as string,
                    email: form.get('email') as string,
                },
            ],
            skipDuplicates: true, // 插入重复数据时，不会报错
        });
    } else if (request.method === 'DELETE') {
        await prisma.user.delete({
            where: {
                id: +(form.get('id') as string),
            },
        });
    }

    return null;
};

const App: React.FC = () => {
    const data = useLoaderData<typeof loader>();
    const submit = useSubmit();
    let { t } = useTranslation();

    const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
        },

        {
            title: '操作',
            dataIndex: '',
            key: 'operation',
            width: 240,
            render: (_: any, { id }: any) => (
                <>
                    <Button
                        type="link"
                        onClick={() => {
                            submit(
                                {
                                    id,
                                },
                                { method: 'DELETE' }
                            );
                        }}
                    >
                        删除
                    </Button>
                </>
            ),
        },
    ];

    const createUser = () => {
        const name = Math.random().toString(36).substr(2, 8);
        submit(
            {
                name,
                email: `${name}@163.com`,
            },
            { method: 'POST' }
        );
    };

    const items = [
        {
            label: '成员管理',
            key: 'user',
        },
    ];

    return (
        <>
            <div
                style={{
                    height: 80,
                    backgroundColor: '#002',
                    color: '#fff',
                    fontSize: 30,
                    lineHeight: '80px',
                    textIndent: '24px',
                }}
            >
                header {t('greeting')}
            </div>
            <div>
                <div style={{ width: 300, float: 'left' }}>
                    <Menu
                        defaultOpenKeys={[`user`]}
                        defaultSelectedKeys={['user']}
                        mode="inline"
                        theme="light"
                        items={items}
                    />
                </div>
                <div style={{ width: 'calc(100% - 348px)', padding: '0 24px', float: 'left' }}>
                    <p style={{ margin: '24px 0', fontSize: 28, fontWeight: 500 }}>成员列表</p>
                    <Button type="primary" onClick={createUser}>
                        新增成员
                    </Button>
                    <Table dataSource={[]} columns={columns} rowKey="id" />;
                </div>
            </div>
        </>
    );
};

export default App;
