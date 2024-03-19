create table Crawled_Page (
    id int auto_increment ,
    url varchar(255),
    time varchar(255),
    title varchar(255),
    primary key (id)
);

create table Outgoing_link (
    from_id int,
    url varchar(255),
    foreign key (from_id) references Crawled_Page(id)
)