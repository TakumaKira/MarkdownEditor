create table users (
  id int not null auto_increment,
  name varchar(255),
  score int not null default 0,
  primary key (id)
);

delimiter //
create procedure insert_users(in x int)
begin
  declare i int default 0;
  while i < x do
    insert into users (name, score) values (concat('name', i), ROUND(RAND() * 1000));
    set i = i + 1;
  end while;
end
//
delimiter ;

call insert_users(100);
