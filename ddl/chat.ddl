-- 初回はCreateTable実行前に下記のデータベース作成を行ってください。
-- create database exchat;

-- ルームリスト
drop table if exists room_list cascade;

create table room_list (
    room_id       INT AUTO_INCREMENT                comment 'ルームid'
  , visitor_id    VARCHAR(100) null                 comment '訪問者id'
  , agent_id      VARCHAR(100) null                 comment 'エージェントid'
  , update_date   TIMESTAMP    not null             comment '更新日時'
  , delete_flg    CHAR         null     DEFAULT '0' comment '削除フラグ'
  , constraint room_list primary key (room_id)
) comment '訪問者リスト' ;

-- エージェントリスト
drop table if exists agent_list cascade;

create table interaction_log (
    visitor_id    VARCHAR(100) not null comment '訪問者id'
  , agent_id      VARCHAR(100) not null comment 'エージェントid'
  , status        INT unsigned not null comment 'ステータス(0:waited, 1:assignded, 2:ended)'
  , create_date   TIMESTAMP    not null comment '作成日時'
  , update_date   TIMESTAMP    not null comment '更新日時'
  , assigned_date TIMESTAMP    null     comment 'アサイン日時'
  , room_commited_date TIMESTAMP null   comment '入室日時'
  , ended_date    TIMESTAMP    null     comment '完了日時'
  , constraint agent_list primary key (agent_id)
) comment 'エージェントリスト' ;

-- エージェントステータス
drop table if exists agent_status cascade;

create table agent_status (
    agent_id       VARCHAR(100) not null comment 'エージェントid'
  , current_assign INT unsigned not null comment '現在対応人数'
  , max_assign     INT unsigned not null comment '最大対応人数'
  , status         INT unsigned not null comment 'ステータス(0:ok, 1:ng, 2:leaved)'
  , lastupdate_ts  TIMESTAMP    null     comment 'レコード更新日時'
  , constraint agent_list primary key (agent_id)
) comment 'エージェントステータス' ;
