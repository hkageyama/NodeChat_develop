-- �����CreateTable���s�O�ɉ��L�̃f�[�^�x�[�X�쐬���s���Ă��������B
-- create database exchat;

-- ���[�����X�g
drop table if exists room_list cascade;

create table room_list (
    room_id       INT AUTO_INCREMENT                comment '���[��id'
  , visitor_id    VARCHAR(100) null                 comment '�K���id'
  , agent_id      VARCHAR(100) null                 comment '�G�[�W�F���gid'
  , update_date   TIMESTAMP    not null             comment '�X�V����'
  , delete_flg    CHAR         null     DEFAULT '0' comment '�폜�t���O'
  , constraint room_list primary key (room_id)
) comment '�K��҃��X�g' ;

-- �G�[�W�F���g���X�g
drop table if exists agent_list cascade;

create table interaction_log (
    visitor_id    VARCHAR(100) not null comment '�K���id'
  , agent_id      VARCHAR(100) not null comment '�G�[�W�F���gid'
  , status        INT unsigned not null comment '�X�e�[�^�X(0:waited, 1:assignded, 2:ended)'
  , create_date   TIMESTAMP    not null comment '�쐬����'
  , update_date   TIMESTAMP    not null comment '�X�V����'
  , assigned_date TIMESTAMP    null     comment '�A�T�C������'
  , room_commited_date TIMESTAMP null   comment '��������'
  , ended_date    TIMESTAMP    null     comment '��������'
  , constraint agent_list primary key (agent_id)
) comment '�G�[�W�F���g���X�g' ;

-- �G�[�W�F���g�X�e�[�^�X
drop table if exists agent_status cascade;

create table agent_status (
    agent_id       VARCHAR(100) not null comment '�G�[�W�F���gid'
  , current_assign INT unsigned not null comment '���ݑΉ��l��'
  , max_assign     INT unsigned not null comment '�ő�Ή��l��'
  , status         INT unsigned not null comment '�X�e�[�^�X(0:ok, 1:ng, 2:leaved)'
  , lastupdate_ts  TIMESTAMP    null     comment '���R�[�h�X�V����'
  , constraint agent_list primary key (agent_id)
) comment '�G�[�W�F���g�X�e�[�^�X' ;
