import React from 'react';
import { Button, Menu, Table } from 'antd';
import { useLoaderData, useSubmit } from '@remix-run/react';
import type { MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
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
        {
            label: '内容管理',
            key: '/cms',
            children: [
                {
                    key: '/cms/product_info',
                    label: '产品信息库',
                    categorie: '/内容管理/产品信息库/查看',
                },
                {
                    key: '/cms/market_content/education',
                    label: '营销内容库',
                    categorie: '/内容管理/营销内容库/查看',
                },
            ],
        },
        {
            label: '品牌',
            categorie: '/品牌/查看',
            key: '/cms/brand_list/company',
        },
        {
            label: '渠道管理',
            key: '/channel',
            children: [
                {
                    key: '/channel/list',
                    categorie: '/渠道管理/渠道列表/查看',
                    label: '渠道列表',
                },
                {
                    key: '/channel/staff',
                    categorie: '/渠道管理/渠道人员/查看',
                    label: '渠道人员',
                },
            ],
        },
        {
            label: '内容分发',
            key: '/pccds',
            children: [
                {
                    key: '/pccds/h5_configuration',
                    categorie: '/内容分发/H5配置/查看',
                    label: 'H5配置',
                },
            ],
        },
        {
            label: '企业管理',
            key: '/corp',
            children: [
                {
                    key: '/corp/authz',
                    categorie: '/企业管理/权限管理/查看',
                    label: '权限管理',
                },
                {
                    key: '/corp/member',
                    categorie: '/企业管理/成员管理/查看',
                    label: '成员管理',
                },
                {
                    key: '/corp/operate_log',
                    categorie: '/企业管理/操作日志/查看',
                    label: '操作日志',
                },
            ],
        },
        {
            label: '活动专区',
            key: '/activities',
            children: [
                {
                    key: '/activities/colorful',
                    categorie: '/活动专区/缤纷活动/查看',
                    label: '缤纷活动',
                },
            ],
        },
        {
            label: '菜单管理',
            key: '/menu_manage',
            children: [
                {
                    key: '/menu_manage/menu_list',
                    categorie: '/菜单管理/菜单列表/查看',
                    label: '菜单列表',
                },
            ],
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
                header
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
                    <Table dataSource={data} columns={columns} rowKey="id" />;
                </div>
            </div>
        </>
    );
};

export default App;
