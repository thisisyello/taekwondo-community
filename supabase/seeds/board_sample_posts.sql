-- Optional sample data. Run manually in the Supabase SQL Editor, not as a migration.
-- Replace the nickname below with an existing member's nickname.
-- Fixed IDs make reruns skip existing samples without changing any existing posts.
-- Batch 2 uses IDs 011-020, so the first batch (001-010) remains untouched.
begin;

do $$
declare
    seed_author_nickname text := '작성자 닉네임';
    seed_author_id uuid;
    inserted_count integer;
begin
    select id into seed_author_id
    from public.profiles
    where lower(btrim(nickname)) = lower(btrim(seed_author_nickname));

    if seed_author_id is null then
        raise exception '작성자 닉네임을 실제 가입된 회원 닉네임으로 변경해주세요. 입력값: %', seed_author_nickname;
    end if;

    insert into public.posts (id, author_id, board, title, content, created_at, updated_at)
    select sample.id::uuid, seed_author_id, sample.board, sample.title, sample.content,
        now() - sample.age, now() - sample.age
    from (values
        ('c0de0000-0000-4000-8000-000000000011', 'free',
         '[샘플] 비 오는 날에도 도장 가는 길은 즐겁네요',
         '우산을 들고 도장에 가다가 함께 수련하는 분을 만났습니다. 짧게 인사를 나눴을 뿐인데 수련을 시작하기 전부터 기분이 좋아졌네요.', interval '9 days'),
        ('c0de0000-0000-4000-8000-000000000012', 'parent',
         '[샘플] 처음으로 아이가 띠를 혼자 챙겼어요',
         '항상 가방을 대신 확인해줬는데 오늘은 아이가 도복과 띠를 먼저 챙겨두었습니다. 도장에 다니면서 스스로 준비하는 일이 조금씩 늘어나는 것 같아요.', interval '8 days'),
        ('c0de0000-0000-4000-8000-000000000013', 'coach',
         '[샘플] 새로 온 관원과 첫 인사를 나누는 시간',
         '새 친구가 어색하지 않도록 기존 관원들과 이름을 나누는 시간을 마련했습니다. 처음 만나는 수업에서 자연스럽게 분위기를 여는 경험을 공유해주세요.', interval '7 days'),
        ('c0de0000-0000-4000-8000-000000000014', 'student',
         '[샘플] 수련 친구와 서로 응원해준 하루',
         '친구가 연습을 마칠 때까지 기다렸다가 함께 정리했습니다. 혼자 할 때보다 서로 응원하며 수련하니 시간이 더 빨리 지나간 느낌입니다.', interval '6 days'),
        ('c0de0000-0000-4000-8000-000000000015', 'question',
         '[샘플] 여러 개의 띠는 어떻게 보관하시나요?',
         '예전에 사용하던 띠도 추억이 있어서 모아두고 있습니다. 서랍에 접어두는 것 말고 보기 좋게 정리하는 방법이 궁금합니다.', interval '5 days'),
        ('c0de0000-0000-4000-8000-000000000016', 'free',
         '[샘플] 도장에서 기억에 남는 응원 한마디',
         '동작이 잘 안 돼서 아쉬웠는데 오늘도 끝까지 했다는 말을 듣고 마음이 가벼워졌습니다. 여러분에게 오래 남아 있는 응원의 말이 있나요?', interval '4 days'),
        ('c0de0000-0000-4000-8000-000000000017', 'parent',
         '[샘플] 가족에게 배운 동작을 소개하는 작은 발표회',
         '아이가 거실에 가족을 모아놓고 도장에서 배운 인사와 동작을 소개했습니다. 순서를 설명하는 모습이 진지해서 모두 박수를 보내줬네요.', interval '3 days'),
        ('c0de0000-0000-4000-8000-000000000018', 'coach',
         '[샘플] 수련을 마친 뒤 관원들과 나누는 질문',
         '마지막 인사 전에 오늘 가장 재미있었던 활동을 한 가지씩 듣고 있습니다. 짧은 대화지만 다음 수업을 준비할 때 참고할 이야기가 많이 나오네요.', interval '2 days'),
        ('c0de0000-0000-4000-8000-000000000019', 'student',
         '[샘플] 이번 달 수련 기록을 다시 읽어봤어요',
         '처음에는 어려웠다고 적어둔 동작이 이제는 익숙해졌다는 점이 신기했습니다. 수련 뒤 한 줄씩 남겼던 기록을 앞으로도 이어가보려고 합니다.', interval '1 day'),
        ('c0de0000-0000-4000-8000-000000000020', 'question',
         '[샘플] 오래 기억하고 싶은 수련 사진은 어떻게 정리하세요?',
         '심사와 행사 때 찍은 사진이 휴대전화에 많이 쌓였습니다. 날짜별로 모으는지, 행사별 앨범을 만드는지 다른 분들의 정리 방식이 궁금합니다.', interval '2 hours')
    ) as sample(id, board, title, content, age)
    on conflict (id) do nothing;

    get diagnostics inserted_count = row_count;
    raise notice '샘플 게시글 %개를 추가했습니다. 기존 샘플은 변경하지 않습니다.', inserted_count;
end;
$$;

commit;
