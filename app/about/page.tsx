import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { commonTechStack, otherTechStack } from './techStack';

export const metadata: Metadata = {
  title: "About | Jsonq's Blog",
};

const headingIntroduce = [
  '你好，我是 Jsonq（焦松奇），一名<span class="line-through">（API 调用）</span>前端开发人员，主要使用 React、Vue、TypeScript、antd 相关技术进行日常开发和工作。',
  '三年工作经验，目前就职于北京某公司，工作中常用技术栈为 React + antd + <a class="text-link" target="_blank" rel="noopener noreferrer" href="https://learn.microsoft.com/en-us/sharepoint/dev/schema/query-schema">SharePoint CamlQuery</a> + pnpjs（SharePoint Orm）',
];

const workIntroduceContent = [
  '需求分析、功能设计、技术选型、业务数据表结构设计（团队内部讨论）',
  '基于 SharePoint 进行需求功能开发',
  '负责前端项目技术选型及搭建，基础建设功能开发和维护（本人负责）',
  '参与后端 Java 技术栈开发的部分工作',
];

export default function AboutPage() {
  return (
    <div className="py-6">
      <div className="px-4 md:px-12">
        {headingIntroduce.map((item, index) => (
          <p className="py-2 first:pt-0" key={index} dangerouslySetInnerHTML={{ __html: item }} />
        ))}

        <h2 className="my-4 text-3xl font-semibold tracking-tight">Functions</h2>
        <p className="text-foreground/60 mb-2 text-sm">
          主要基于 SharePoint 内网平台的定制化功能开发，工作内容较杂，不局限于前端
        </p>
        <ul className="list-disc" role="list">
          {workIntroduceContent.map((content, index) => (
            <li key={index} className="py-1">
              {content}
            </li>
          ))}
        </ul>

        <h2 className="my-4 text-3xl font-semibold tracking-tight">Tech Stack</h2>
        <ul role="list" className="flex flex-wrap gap-6 py-4">
          {commonTechStack.map((tech, index) => (
            <li key={index}>
              <Link href={tech.href} target="_blank" rel="noopener">
                <tech.icon style={{ color: tech.color }} className="size-8" />
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="my-4 text-3xl font-semibold tracking-tight">Learning</h2>
        <ul role="list" className="flex flex-wrap gap-6 py-4">
          {otherTechStack.map((tech, index) => (
            <li key={index}>
              <Link href={tech.href} target="_blank" rel="noopener">
                <tech.icon style={{ color: tech.color }} className="size-8" />
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="my-4 text-3xl font-semibold tracking-tight">Contact</h2>
        <p className="flex items-center">
          <Mail />
          <a className="text-link ml-2" href="mailto:j996730508@163.com" rel="noopener noreferrer">
            j996730508@163.com
          </a>
        </p>
      </div>
    </div>
  );
}
